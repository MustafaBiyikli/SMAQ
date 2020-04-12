package com.samadevelopment.mustafa.smaq;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
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

    Boolean connected = false;

    public void connect(View view) {
        String urlAddress = "http://" + ipAddress.getText().toString() + ":8000/";

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
            if (bResponse==true) {
                // Go to WebView
                Toast.makeText(MainActivity.this, "URL exists", Toast.LENGTH_SHORT).show();
            }
            else Toast.makeText(MainActivity.this, "URL does not exist", Toast.LENGTH_SHORT).show();;
        }
    }
}
