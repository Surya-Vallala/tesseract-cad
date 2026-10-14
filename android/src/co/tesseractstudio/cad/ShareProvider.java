package co.tesseractstudio.cad;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * Lets other apps (WhatsApp, Gmail, Drive…) read a file the user chose to share, for as long as Android grants them
 * access. Only files in the app's cache/share folder are reachable; nothing else in the app is exposed.
 */
public class ShareProvider extends ContentProvider {
    static final String AUTHORITY = "co.tesseractstudio.cad.share";

    static String safeName(String name) {
        String s = name == null ? "file" : name.replaceAll("[\\\\/:*?\"<>|\\x00-\\x1f]", "_").trim();
        if (s.isEmpty() || s.equals(".") || s.equals("..")) s = "file";
        return s.length() > 120 ? s.substring(s.length() - 120) : s;
    }

    File fileFor(Uri uri) throws FileNotFoundException {
        String seg = uri.getLastPathSegment();
        if (seg == null) throw new FileNotFoundException();
        File dir = new File(getContext().getCacheDir(), "share");
        File f = new File(dir, safeName(seg));
        try {
            if (!f.getCanonicalPath().startsWith(dir.getCanonicalPath() + File.separator)) throw new FileNotFoundException();
        } catch (IOException e) { throw new FileNotFoundException(); }
        if (!f.exists()) throw new FileNotFoundException();
        return f;
    }

    @Override public boolean onCreate() { return true; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(fileFor(uri), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] args, String sort) {
        File f;
        try { f = fileFor(uri); } catch (FileNotFoundException e) { return null; }
        String[] cols = projection != null ? projection : new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE};
        MatrixCursor c = new MatrixCursor(cols, 1);
        Object[] row = new Object[cols.length];
        for (int i = 0; i < cols.length; i++) {
            if (OpenableColumns.DISPLAY_NAME.equals(cols[i])) row[i] = f.getName();
            else if (OpenableColumns.SIZE.equals(cols[i])) row[i] = f.length();
        }
        c.addRow(row);
        return c;
    }

    @Override
    public String getType(Uri uri) {
        String n = String.valueOf(uri.getLastPathSegment()).toLowerCase();
        if (n.endsWith(".pdf")) return "application/pdf";
        if (n.endsWith(".dxf")) return "application/dxf";
        if (n.endsWith(".dwg")) return "application/acad";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".zip")) return "application/zip";
        if (n.endsWith(".csv")) return "text/csv";
        return "application/octet-stream";
    }

    @Override public Uri insert(Uri uri, ContentValues v) { throw new UnsupportedOperationException(); }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
