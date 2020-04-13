package com.samadevelopment.mustafa.smaq;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity {

    ImageView connectButton;
    EditText ipAddress;
    Vibrator vibrator;

    Intent smaqIntent;

    String urlAddress;
    Boolean connected = false;

    SharedPreferences sharedPreferences;

    public void connect(View view) {
        urlAddress = "http://" + ipAddress.getText().toString() + ":8000";

        vibrator.vibrate(10);
        connectButton.animate().rotationBy(360).setDuration(500);

        if (connected) {
            if (ipAddress.getText().toString().equals("")) {
                Toast.makeText(this, "You need to type an IP | i.e: 192.168.1.8", Toast.LENGTH_SHORT).show();
            } else {
                CheckURL checkURL = new CheckURL();
                checkURL.execute(urlAddress);
            }
        } else {
            Toast.makeText(this, "No network connection", Toast.LENGTH_SHORT).show();
        }

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        connectButton = findViewById(R.id.imageView);
        ipAddress = findViewById(R.id.ipInput);
        vibrator = (Vibrator) this.getSystemService(VIBRATOR_SERVICE);

        smaqIntent = new Intent(getApplicationContext(), smaqActivity.class);

        sharedPreferences = this.getSharedPreferences("com.samadevelopment.mustafa.smaq", Context.MODE_PRIVATE);

        try {
            String saved_urlAddress = sharedPreferences.getString("saved_urlAddress", "");
            ipAddress.setText(saved_urlAddress);
        } catch (Exception e) {
            e.printStackTrace();
        }

        ConnectivityManager connectivityManager = (ConnectivityManager)getSystemService(Context.CONNECTIVITY_SERVICE);
        if(connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState() == NetworkInfo.State.CONNECTED ||
                connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState() == NetworkInfo.State.CONNECTED) {
            connected = true;
        }
        else
            connected = false;
    }

    private class CheckURL extends AsyncTask<String, Void, Boolean> {

        @Override
        protected void onPreExecute() {

        }

        @Override
        protected Boolean doInBackground(String... params) {

            try {
                HttpURLConnection.setFollowRedirects(false);
                HttpURLConnection httpURLConnection =  (HttpURLConnection) new URL(params[0]).openConnection();
                httpURLConnection.setRequestMethod("HEAD");
                httpURLConnection.setConnectTimeout(1000);
                return (httpURLConnection.getResponseCode() == HttpURLConnection.HTTP_OK);
            }
            catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean result) {
            boolean bResponse = result;
            if (bResponse) {
                try {
                    sharedPreferences.edit().putString("saved_urlAddress", ipAddress.getText().toString()).apply();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                smaqIntent.putExtra("urlAddress", urlAddress);
                startActivityForResult(smaqIntent, 1);
            }
            else Toast.makeText(MainActivity.this, "URL does not exist", Toast.LENGTH_SHORT).show();
        }
    }

    public void hideKeyboard() {
        InputMethodManager inputMethodManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(), 0);
    }

    public void layoutClick(View view) {
        hideKeyboard();
    }

    public void logoClick(View view) {
        hideKeyboard();
    }
}
