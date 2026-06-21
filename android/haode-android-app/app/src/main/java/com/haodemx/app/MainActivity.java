package com.haodemx.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.ViewGroup;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String ENTRY_URL = "https://haodemx.github.io/haode-web/app/?v=ui-v2";
    private static final String INTERNAL_HOST = "haodemx.github.io";
    private static final String INTERNAL_PATH = "/haode-web/app";
    private static final int HAODE_ORANGE = Color.rgb(255, 95, 5);

    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private FrameLayout contentFrame;
    private View splashView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();
        buildLayout();
        configureWebView();
        showSplashThenLoad();
    }

    private void buildLayout() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                    insets.getSystemWindowInsetLeft(),
                    insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(),
                    insets.getSystemWindowInsetBottom()
            );
            return insets;
        });

        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.setBackgroundColor(Color.WHITE);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(12), dp(8), dp(12), dp(8));
        toolbar.setBackgroundColor(Color.WHITE);

        Button backButton = toolbarButton("‹");
        backButton.setOnClickListener(view -> {
            if (webView.canGoBack()) {
                webView.goBack();
            }
        });

        TextView title = new TextView(this);
        title.setText("HAODE México");
        title.setTextColor(Color.rgb(17, 19, 24));
        title.setTextSize(18);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER_VERTICAL);
        title.setSingleLine(true);

        Button refreshButton = toolbarButton("↻");
        refreshButton.setOnClickListener(view -> reloadCurrentPage());

        toolbar.addView(backButton, new LinearLayout.LayoutParams(dp(48), dp(44)));
        toolbar.addView(title, new LinearLayout.LayoutParams(0, dp(44), 1));
        toolbar.addView(refreshButton, new LinearLayout.LayoutParams(dp(48), dp(44)));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setIndeterminate(false);
        progressBar.setMax(100);
        progressBar.setVisibility(View.GONE);

        contentFrame = new FrameLayout(this);
        webView = new WebView(this);
        errorView = buildErrorView();
        errorView.setVisibility(View.GONE);

        contentFrame.addView(webView, matchParent());
        contentFrame.addView(errorView, matchParent());

        shell.addView(toolbar);
        shell.addView(progressBar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));
        shell.addView(contentFrame, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        splashView = buildSplashView();
        root.addView(shell, matchParent());
        root.addView(splashView, matchParent());
        setContentView(root);
        root.requestApplyInsets();
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUserAgentString(settings.getUserAgentString() + " HAODEAndroidApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (shouldStayInWebView(uri)) {
                    return false;
                }
                openExternal(uri);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showError();
                }
            }
        });

        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }
        });
    }

    private void showSplashThenLoad() {
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            splashView.setVisibility(View.GONE);
            webView.loadUrl(ENTRY_URL);
        }, 900);
    }

    private boolean shouldStayInWebView(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
        if (!scheme.equals("http") && !scheme.equals("https")) {
            return false;
        }

        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
        String path = uri.getPath() == null ? "" : uri.getPath();
        return host.equals(INTERNAL_HOST) && path.startsWith(INTERNAL_PATH);
    }

    private void openExternal(Uri uri) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException ignored) {
            showError();
        }
    }

    private void reloadCurrentPage() {
        errorView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        if (webView.getUrl() == null) {
            webView.loadUrl(ENTRY_URL);
        } else {
            webView.reload();
        }
    }

    private void showError() {
        progressBar.setVisibility(View.GONE);
        webView.setVisibility(View.GONE);
        errorView.setVisibility(View.VISIBLE);
    }

    private LinearLayout buildErrorView() {
        LinearLayout layout = new LinearLayout(this);
        layout.setGravity(Gravity.CENTER);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dp(28), dp(28), dp(28), dp(28));
        layout.setBackgroundColor(Color.WHITE);

        TextView title = new TextView(this);
        title.setText("No se pudo conectar");
        title.setTextColor(Color.rgb(17, 19, 24));
        title.setTextSize(22);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);

        TextView copy = new TextView(this);
        copy.setText("Revisa tu conexión e intenta de nuevo.");
        copy.setTextColor(Color.rgb(105, 111, 122));
        copy.setTextSize(15);
        copy.setGravity(Gravity.CENTER);
        copy.setPadding(0, dp(10), 0, dp(20));

        Button retry = new Button(this);
        retry.setText("Reintentar");
        retry.setTextColor(Color.WHITE);
        retry.setBackgroundColor(HAODE_ORANGE);
        retry.setOnClickListener(view -> {
            errorView.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(ENTRY_URL);
        });

        layout.addView(title);
        layout.addView(copy);
        layout.addView(retry, new LinearLayout.LayoutParams(dp(180), dp(48)));
        return layout;
    }

    private View buildSplashView() {
        LinearLayout splash = new LinearLayout(this);
        splash.setGravity(Gravity.CENTER);
        splash.setOrientation(LinearLayout.VERTICAL);
        splash.setBackgroundColor(Color.WHITE);

        TextView mark = new TextView(this);
        mark.setText("H");
        mark.setTextColor(HAODE_ORANGE);
        mark.setTextSize(54);
        mark.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        mark.setGravity(Gravity.CENTER);
        mark.setBackgroundResource(R.drawable.haode_mark_ring);

        TextView title = new TextView(this);
        title.setText("HAODE México");
        title.setTextColor(HAODE_ORANGE);
        title.setTextSize(28);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, dp(22), 0, dp(6));

        TextView subtitle = new TextView(this);
        subtitle.setText("CALIDAD PROFESIONAL");
        subtitle.setTextColor(HAODE_ORANGE);
        subtitle.setTextSize(13);
        subtitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        subtitle.setLetterSpacing(0.12f);
        subtitle.setGravity(Gravity.CENTER);

        splash.addView(mark, new LinearLayout.LayoutParams(dp(96), dp(96)));
        splash.addView(title);
        splash.addView(subtitle);
        return splash;
    }

    private Button toolbarButton(String text) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextColor(Color.rgb(17, 19, 24));
        button.setTextSize(24);
        button.setBackgroundColor(Color.TRANSPARENT);
        return button;
    }

    private FrameLayout.LayoutParams matchParent() {
        return new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
