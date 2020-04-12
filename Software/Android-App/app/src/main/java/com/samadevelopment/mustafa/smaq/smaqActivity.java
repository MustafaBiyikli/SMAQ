package com.samadevelopment.mustafa.smaq;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.android.material.bottomnavigation.BottomNavigationView;

public class smaqActivity extends AppCompatActivity {

    Intent mainActivity;
    String urlAddress;
    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_smaq);

        mainActivity = getIntent();
        urlAddress = mainActivity.getStringExtra("urlAddress");

        webView = findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());

        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
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
                        break;
                }
                return true;
            }
        });
    }
}
