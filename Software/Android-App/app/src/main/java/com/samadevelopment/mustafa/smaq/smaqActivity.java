package com.samadevelopment.mustafa.smaq;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;

import android.content.Intent;
import android.graphics.Rect;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;

import java.nio.channels.OverlappingFileLockException;

public class smaqActivity extends AppCompatActivity {

    Intent mainActivity;
    String urlAddress;
    WebView webView;
    DrawerLayout drawerLayout;
    NavigationView navigationView;
    BottomNavigationView bottomNavigationView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_smaq);

        mainActivity = getIntent();
        urlAddress = mainActivity.getStringExtra("urlAddress");

        webView = findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.setWebViewClient(new WebViewClient());
        webView.bringToFront();
        webView.loadUrl(urlAddress + "/app&dashboard");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                drawerLayout.closeDrawer(Gravity.RIGHT);
            }
        });

        drawerLayout = findViewById(R.id.drawer_layout);
        drawerLayout.addDrawerListener(new DrawerLayout.DrawerListener() {
            @Override
            public void onDrawerSlide(@NonNull View drawerView, float slideOffset) {

            }

            @Override
            public void onDrawerOpened(@NonNull View drawerView) {

            }

            @Override
            public void onDrawerClosed(@NonNull View drawerView) {
                webView.bringToFront();
            }

            @Override
            public void onDrawerStateChanged(int newState) {

            }
        });

        bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnNavigationItemSelectedListener(new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                switch (item.getItemId()) {
                    case R.id.dashboard:
                        webView.loadUrl(urlAddress + "/app&dashboard");
                        break;
                    case R.id.alerts:
                        webView.loadUrl(urlAddress + "/app/v1/alerts");
                        break;
                    case R.id.options:
                        drawerLayout.openDrawer(Gravity.RIGHT);
                        drawerLayout.bringToFront();
                        break;
                }
                return true;
            }
        });

        navigationView = findViewById(R.id.navigation_view);
        navigationView.setNavigationItemSelectedListener(new NavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                switch (item.getItemId()) {
                    case R.id.settings:
                        webView.loadUrl(urlAddress + "/app/v1/settings");
                        break;
                    case R.id.about:
                        webView.loadUrl(urlAddress + "/app/v1/about");
                        break;
                    case R.id.contact:
                        webView.loadUrl(urlAddress + "/app/v1/contact");
                        break;
                }
                return true;
            }
        });
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        Rect viewRect = new Rect();
        navigationView.getGlobalVisibleRect(viewRect);
        if (!viewRect.contains((int) ev.getRawX(), (int) ev.getRawY())) {
            drawerLayout.closeDrawer(Gravity.RIGHT);
        }
        return super.dispatchTouchEvent(ev);
    }
}
