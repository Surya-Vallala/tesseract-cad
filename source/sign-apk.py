#!/usr/bin/env python3
"""
Signs an aligned, unsigned APK with APK Signature Scheme v2 (what Android 7+ checks), using the Tesseract CAD
release key (PKCS#12). Every update must be signed with this same key, or Android refuses to install it over
the existing app.

    python3 sign-apk.py unsigned-aligned.apk signed.apk android-keys/tesseract-cad-release.p12 android-keys/keystore-password.txt

Format (source.android.com/docs/security/features/apksigning/v2): the APK is [ZIP entries][APK Signing Block]
[Central Directory][End of Central Directory]. The signed digest covers entries, central directory and EOCD in
1 MB chunks; the signing block is inserted before the central directory and the EOCD's offset is moved along.
The result is checked with Google's apksigner on GitHub Actions (ci/verify.sh).
"""
import hashlib
import struct
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import pkcs12

SIG_RSA_PKCS1_SHA256 = 0x0103
V2_BLOCK_ID = 0x7109871A
MAGIC = b"APK Sig Block 42"
CHUNK = 1024 * 1024


def lp(b):  # uint32 length-prefixed
    return struct.pack("<I", len(b)) + b


def find_eocd(data):
    # EOCD is 22 bytes + comment (up to 65535); search backwards for its signature
    for i in range(len(data) - 22, max(-1, len(data) - 22 - 65536), -1):
        if data[i:i + 4] == b"PK\x05\x06":
            (comment_len,) = struct.unpack("<H", data[i + 20:i + 22])
            if i + 22 + comment_len == len(data):
                return i
    raise ValueError("not a ZIP/APK (no end-of-central-directory record)")


def chunked_digest(sections):
    digests = []
    for sec in sections:
        for off in range(0, len(sec), CHUNK):
            c = sec[off:off + CHUNK]
            digests.append(hashlib.sha256(b"\xa5" + struct.pack("<I", len(c)) + c).digest())
    return hashlib.sha256(b"\x5a" + struct.pack("<I", len(digests)) + b"".join(digests)).digest()


def sign(src, dst, p12_path, pass_path):
    data = open(src, "rb").read()
    eocd = find_eocd(data)
    cd_size, cd_off = struct.unpack("<II", data[eocd + 12:eocd + 20])
    if cd_off + cd_size != eocd:
        raise ValueError("unexpected ZIP layout (data between central directory and EOCD)")
    if data[cd_off - 16:cd_off] == MAGIC:
        raise ValueError("this APK is already signed")
    entries, cdir, end = data[:cd_off], data[cd_off:eocd], data[eocd:]

    password = open(pass_path, "rb").read().strip()
    key, cert, _ = pkcs12.load_key_and_certificates(open(p12_path, "rb").read(), password)
    cert_der = cert.public_bytes(serialization.Encoding.DER)
    pub_der = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)

    digest = chunked_digest([entries, cdir, end])
    signed_data = (
        lp(lp(struct.pack("<I", SIG_RSA_PKCS1_SHA256) + lp(digest)))  # digests
        + lp(lp(cert_der))                                           # certificates
        + lp(b"")                                                    # additional attributes
    )
    signature = key.sign(signed_data, padding.PKCS1v15(), hashes.SHA256())
    signer = lp(signed_data) + lp(lp(struct.pack("<I", SIG_RSA_PKCS1_SHA256) + lp(signature))) + lp(pub_der)
    value = lp(lp(signer))  # sequence of signers (one)

    pair = struct.pack("<I", V2_BLOCK_ID) + value
    pairs = struct.pack("<Q", len(pair)) + pair
    block_size = len(pairs) + 8 + 16
    block = struct.pack("<Q", block_size) + pairs + struct.pack("<Q", block_size) + MAGIC

    new_end = end[:16] + struct.pack("<I", cd_off + len(block)) + end[20:]
    open(dst, "wb").write(entries + block + cdir + new_end)
    print("signed", dst, "·", len(entries + block + cdir + new_end), "bytes · cert SHA-256", hashlib.sha256(cert_der).hexdigest())


if __name__ == "__main__":
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    sign(*sys.argv[1:])
