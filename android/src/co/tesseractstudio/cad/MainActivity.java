package co.tesseractstudio.cad;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.OpenableColumns;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Tesseract CAD for Android.
 *
 * The app itself is the same web app as the website, bundled inside the APK under assets/www and served to a
 * WebView from https://appassets.androidplatform.net/ (a private address that never touches the network).
 * Nothing goes online unless you tap "Check for updates" in the app and agree.
 *
 * This class adds what a browser normally provides: picking files, "Open with" and "Share to" from other apps,
 * saving and sharing exported files, the back button, and installing a downloaded update.
 * The page talks to it through window.TCNative (see Bridge) and gets answers through window.tcNativeCb(id, state, msg).
 */
public class MainActivity extends Activity {
    static final String TAG = "TesseractCAD";
    static final String HOST = "appassets.androidplatform.net";
    static final String BASE = "https://" + HOST + "/";
    static final String ACTION_INSTALL_STATUS = "co.tesseractstudio.cad.INSTALL_STATUS";
    static final int REQ_OPEN = 11, REQ_SAVE = 12;

    WebView web;
    FrameLayout root;
    final Handler ui = new Handler(Looper.getMainLooper());
    ValueCallback<Uri[]> fileCb;
    final List<String[]> incoming = new ArrayList<>(); // {name, url} of files handed to the app, waiting for the page
    int sharedSeq = 0;
    String saveId; byte[] saveBytes;
    String updateId; File updateApk; volatile boolean updateCancelled; boolean waitingForInstallPermission;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow();
        // Edge to edge (Android 15+ always does this); padding below keeps the page clear of the bars and the keyboard.
        if (Build.VERSION.SDK_INT >= 30) w.setDecorFitsSystemWindows(false);
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);
        root = new FrameLayout(this);
        root.setBackgroundColor(0xFF161618);
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(i.left, i.top, i.right, i.bottom);
                return WindowInsets.CONSUMED;
            }
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        setContentView(root);
        applyBars("#161618", false);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return serve(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { Log.w(TAG, "no app for " + u); }
                return true; // e-mail and web links open in their own apps
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*"); // DWG files have no reliable type on Android, so show everything
                if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try { startActivityForResult(i, REQ_OPEN); } catch (Exception e) { fileCb = null; cb.onReceiveValue(null); return false; }
                return true;
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.i(TAG, "console: " + m.message() + " @" + m.sourceId() + ":" + m.lineNumber());
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "TCNative");

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::onBack);
        }
        clearDir(new File(getCacheDir(), "shared"));
        clearDir(new File(getCacheDir(), "share"));
        handleIntent(getIntent());
        web.loadUrl(BASE + "index.html");
    }

    // ---------- serving the bundled app ----------
    static String mime(String p) {
        String n = p.toLowerCase();
        if (n.endsWith(".html")) return "text/html";
        if (n.endsWith(".js") || n.endsWith(".mjs")) return "text/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".wasm")) return "application/wasm";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".woff2")) return "font/woff2";
        if (n.endsWith(".webmanifest")) return "application/manifest+json";
        if (n.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    WebResourceResponse serve(Uri u) {
        if (!HOST.equals(u.getHost())) return null; // anything else (only the update check) goes to the network
        String path = u.getPath();
        if (path == null || path.isEmpty() || path.equals("/")) path = "/index.html";
        Map<String, String> h = new HashMap<>();
        h.put("Access-Control-Allow-Origin", "*");
        h.put("Cache-Control", "no-cache");
        try {
            InputStream in;
            String type;
            if (path.startsWith("/shared/")) {
                String n = path.substring(8).replaceAll("[^0-9]", "");
                in = new FileInputStream(new File(new File(getCacheDir(), "shared"), n));
                type = "application/octet-stream";
            } else {
                if (path.contains("..")) throw new IOException("bad path");
                in = getAssets().open("www" + path);
                type = mime(path);
            }
            String enc = type.startsWith("text/") || type.equals("application/json") ? "utf-8" : null;
            return new WebResourceResponse(type, enc, 200, "OK", h, in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new ByteArrayInputStream(new byte[0]));
        }
    }

    // ---------- talking to the page ----------
    void cb(String id, String state, String msg) {
        if (id == null) return;
        final String js = "window.tcNativeCb&&tcNativeCb(" + JSONObject.quote(id) + "," + JSONObject.quote(state) + "," + JSONObject.quote(msg == null ? "" : msg) + ")";
        ui.post(() -> web.evaluateJavascript(js, null));
    }

    void applyBars(String color, boolean light) {
        try { root.setBackgroundColor(Color.parseColor(color)); } catch (Exception e) { return; }
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                int both = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                c.setSystemBarsAppearance(light ? both : 0, both);
            }
        } else {
            int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            if (light) f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            getWindow().getDecorView().setSystemUiVisibility(f);
        }
    }

    class Bridge {
        /** Files opened with or shared to the app since the page last asked: [{name, url}] */
        @JavascriptInterface
        public String pendingFiles() {
            JSONArray a = new JSONArray();
            synchronized (incoming) {
                for (String[] f : incoming) {
                    JSONObject o = new JSONObject();
                    try { o.put("name", f[0]); o.put("url", f[1]); } catch (Exception ignored) { }
                    a.put(o);
                }
                incoming.clear();
            }
            return a.toString();
        }

        @JavascriptInterface
        public String appInfo() {
            JSONObject o = new JSONObject();
            try {
                PackageInfo p = getPackageManager().getPackageInfo(getPackageName(), 0);
                o.put("versionName", p.versionName);
                o.put("versionCode", Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode);
                o.put("android", Build.VERSION.SDK_INT);
            } catch (Exception ignored) { }
            return o.toString();
        }

        /** Save a file with Android's own "save as" picker. */
        @JavascriptInterface
        public void saveFile(String id, String name, String type, String b64) {
            final byte[] bytes;
            try { bytes = Base64.decode(b64, Base64.DEFAULT); } catch (Exception e) { cb(id, "error", "the file could not be prepared"); return; }
            ui.post(() -> {
                saveId = id; saveBytes = bytes;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(type == null || type.isEmpty() ? "application/octet-stream" : type);
                i.putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, REQ_SAVE); } catch (Exception e) { saveId = null; saveBytes = null; cb(id, "error", "no file picker on this phone"); }
            });
        }

        /** Share a file through Android's share sheet (any type: DWG and DXF go to WhatsApp as documents). */
        @JavascriptInterface
        public void shareFile(String id, String name, String type, String b64) {
            try {
                byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
                String safe = ShareProvider.safeName(name);
                File dir = new File(getCacheDir(), "share");
                dir.mkdirs();
                try (OutputStream o = new FileOutputStream(new File(dir, safe))) { o.write(bytes); }
                Uri u = Uri.parse("content://" + ShareProvider.AUTHORITY + "/" + Uri.encode(safe));
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType(type == null || type.isEmpty() ? "application/octet-stream" : type);
                i.putExtra(Intent.EXTRA_STREAM, u);
                i.setClipData(ClipData.newRawUri(safe, u));
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent chooser = Intent.createChooser(i, "Share " + safe);
                chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                ui.post(() -> {
                    try { startActivity(chooser); cb(id, "ok", ""); } catch (Exception e) { cb(id, "error", "no app can receive this file"); }
                });
            } catch (Exception e) { cb(id, "error", String.valueOf(e.getMessage())); }
        }

        /** Colour of the status and navigation bar areas, so they match the app's theme. */
        @JavascriptInterface
        public void setBars(String color, boolean light) { ui.post(() -> applyBars(color, light)); }

        /** Download an update and hand it to Android's installer. */
        @JavascriptInterface
        public void installUpdate(String id, String url, String sha256, String size) {
            long n = 0;
            try { n = Long.parseLong(size); } catch (Exception ignored) { }
            startUpdate(id, url, sha256, n);
        }

        @JavascriptInterface
        public void cancelUpdate(String id) { updateCancelled = true; }
    }

    // ---------- results from pickers ----------
    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_OPEN) {
            Uri[] r = null;
            if (res == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    ClipData c = data.getClipData();
                    r = new Uri[c.getItemCount()];
                    for (int k = 0; k < r.length; k++) r[k] = c.getItemAt(k).getUri();
                } else if (data.getData() != null) r = new Uri[]{data.getData()};
            }
            if (fileCb != null) fileCb.onReceiveValue(r);
            fileCb = null;
            return;
        }
        if (req == REQ_SAVE) {
            final String id = saveId;
            final byte[] bytes = saveBytes;
            saveId = null; saveBytes = null;
            if (res != RESULT_OK || data == null || data.getData() == null || bytes == null) { cb(id, "cancel", ""); return; }
            final Uri u = data.getData();
            new Thread(() -> {
                try (OutputStream o = openForWrite(u)) { o.write(bytes); cb(id, "ok", ""); }
                catch (Exception e) { cb(id, "error", String.valueOf(e.getMessage())); }
            }).start();
            return;
        }
        super.onActivityResult(req, res, data);
    }

    OutputStream openForWrite(Uri u) throws IOException {
        try { return getContentResolver().openOutputStream(u, "wt"); } catch (Exception e) { return getContentResolver().openOutputStream(u, "w"); }
    }

    // ---------- "Open with" and "Share to" ----------
    @Override
    protected void onNewIntent(Intent it) {
        super.onNewIntent(it);
        if (it != null && ACTION_INSTALL_STATUS.equals(it.getAction())) { onInstallStatus(it); return; }
        handleIntent(it);
    }

    @SuppressWarnings("deprecation")
    void handleIntent(Intent it) {
        if (it == null) return;
        String a = it.getAction();
        final List<Uri> uris = new ArrayList<>();
        if (Intent.ACTION_VIEW.equals(a) && it.getData() != null) uris.add(it.getData());
        else if (Intent.ACTION_SEND.equals(a)) {
            Object o = it.getParcelableExtra(Intent.EXTRA_STREAM);
            if (o instanceof Uri) uris.add((Uri) o);
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(a)) {
            ArrayList<Uri> l = it.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (l != null) uris.addAll(l);
        }
        if (uris.isEmpty()) return;
        new Thread(() -> {
            for (Uri u : uris) copyIncoming(u);
            ui.post(() -> web.evaluateJavascript("window.tcNativeIncoming&&tcNativeIncoming()", null));
        }).start();
    }

    void copyIncoming(Uri u) {
        String name = null;
        try (Cursor c = getContentResolver().query(u, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) name = c.getString(0);
        } catch (Exception ignored) { }
        if (name == null) name = u.getLastPathSegment();
        if (name == null) name = "drawing";
        File dir = new File(getCacheDir(), "shared");
        dir.mkdirs();
        int n;
        synchronized (incoming) { n = sharedSeq++; }
        File f = new File(dir, String.valueOf(n));
        try (InputStream in = getContentResolver().openInputStream(u); OutputStream out = new FileOutputStream(f)) {
            if (in == null) throw new IOException("no data");
            byte[] buf = new byte[65536];
            int k;
            while ((k = in.read(buf)) > 0) out.write(buf, 0, k);
            synchronized (incoming) { incoming.add(new String[]{name, BASE + "shared/" + n}); }
        } catch (Exception e) {
            Log.w(TAG, "could not read " + u + ": " + e);
            f.delete();
        }
    }

    // ---------- updates ----------
    void startUpdate(final String id, final String url, final String sha256, final long size) {
        updateId = id;
        updateCancelled = false;
        new Thread(() -> {
            File dir = new File(getCacheDir(), "update");
            dir.mkdirs();
            File f = new File(dir, "update.apk");
            f.delete();
            try {
                if (!url.startsWith("https://")) throw new IOException("updates must come over https");
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(20000);
                c.setReadTimeout(30000);
                c.setInstanceFollowRedirects(true);
                int code = c.getResponseCode();
                if (code != 200) throw new IOException("the server answered " + code);
                long total = c.getContentLengthLong();
                if (total <= 0) total = size;
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                long done = 0, last = 0;
                try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(f)) {
                    byte[] buf = new byte[65536];
                    int k;
                    while ((k = in.read(buf)) > 0) {
                        if (updateCancelled) throw new InterruptedIOException("cancelled");
                        out.write(buf, 0, k);
                        md.update(buf, 0, k);
                        done += k;
                        long now = SystemClock.uptimeMillis();
                        if (now - last > 150) { last = now; cb(id, "progress", done + "/" + total); }
                    }
                }
                cb(id, "progress", done + "/" + total);
                StringBuilder hex = new StringBuilder();
                for (byte x : md.digest()) hex.append(String.format("%02x", x));
                if (sha256 != null && !sha256.isEmpty() && !sha256.equalsIgnoreCase(hex.toString())) throw new IOException("the download was damaged (checksum mismatch)");
                PackageInfo pi = getPackageManager().getPackageArchiveInfo(f.getPath(), 0);
                if (pi == null || !getPackageName().equals(pi.packageName)) throw new IOException("the download is not a Tesseract CAD update");
                ui.post(() -> installOrAsk(id, f));
            } catch (InterruptedIOException e) {
                f.delete();
                cb(id, "cancel", "");
            } catch (Exception e) {
                f.delete();
                cb(id, "error", e.getMessage() == null ? e.toString() : e.getMessage());
            }
        }).start();
    }

    void installOrAsk(String id, File f) {
        if (!getPackageManager().canRequestPackageInstalls()) {
            // Android asks once: "Allow from this source" for Tesseract CAD. We carry on in onResume.
            updateApk = f;
            waitingForInstallPermission = true;
            cb(id, "need-permission", "");
            try { startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()))); }
            catch (Exception e) { waitingForInstallPermission = false; cb(id, "error", "Android's settings page could not be opened"); }
            return;
        }
        commitInstall(id, f);
    }

    void commitInstall(final String id, final File f) {
        new Thread(() -> {
            try {
                PackageInstaller pi = getPackageManager().getPackageInstaller();
                PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
                p.setAppPackageName(getPackageName());
                p.setSize(f.length());
                int sid = pi.createSession(p);
                try (PackageInstaller.Session s = pi.openSession(sid)) {
                    try (OutputStream out = s.openWrite("base.apk", 0, f.length()); InputStream in = new FileInputStream(f)) {
                        byte[] buf = new byte[65536];
                        int k;
                        while ((k = in.read(buf)) > 0) out.write(buf, 0, k);
                        s.fsync(out);
                    }
                    Intent st = new Intent(this, MainActivity.class).setAction(ACTION_INSTALL_STATUS).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
                    PendingIntent pend = PendingIntent.getActivity(this, sid, st, flags);
                    s.commit(pend.getIntentSender());
                }
                cb(id, "installing", "");
            } catch (Exception e) {
                cb(id, "error", "Android's installer refused the update: " + e.getMessage());
            }
        }).start();
    }

    @SuppressWarnings("deprecation")
    void onInstallStatus(Intent it) {
        int st = it.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Object o = it.getParcelableExtra(Intent.EXTRA_INTENT);
            if (o instanceof Intent) {
                try { startActivity((Intent) o); } catch (Exception e) { cb(updateId, "error", "the installer could not be opened"); }
            }
        } else if (st == PackageInstaller.STATUS_SUCCESS) {
            cb(updateId, "ok", "");
        } else if (st == PackageInstaller.STATUS_FAILURE_ABORTED) {
            cb(updateId, "cancel", "");
        } else {
            String m = it.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
            cb(updateId, "error", m == null ? "the installer stopped (code " + st + ")" : m);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (waitingForInstallPermission) {
            waitingForInstallPermission = false;
            File f = updateApk;
            updateApk = null;
            if (f != null && getPackageManager().canRequestPackageInstalls()) commitInstall(updateId, f);
            else if (f != null) cb(updateId, "error", "Installing updates wasn't allowed. Turn on \"Allow from this source\" for Tesseract CAD and try again.");
        }
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    // ---------- back button ----------
    void onBack() {
        // The page closes its own panels first; then its history (drawing → home); at home the app goes to the background.
        web.evaluateJavascript("(window.tcNativeBack&&tcNativeBack())?1:0", v -> {
            if ("1".equals(v)) return;
            if (web.canGoBack()) web.goBack();
            else moveTaskToBack(true);
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() { onBack(); } // Android 12 and older (13+ uses the callback registered in onCreate)

    static void clearDir(File d) {
        File[] l = d.listFiles();
        if (l != null) for (File f : l) f.delete();
    }
}
