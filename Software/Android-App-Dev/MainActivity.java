package com.example.rtep_glasgow;

import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import android.content.Context;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;
import com.parse.GetCallback;
import com.parse.Parse;
import com.parse.ParseAnalytics;
import com.parse.ParseException;
import com.parse.ParseObject;
import com.parse.ParseQuery;
import com.parse.SaveCallback;
import com.parse.livequery.ParseLiveQueryClient;
import com.parse.livequery.SubscriptionHandling;
import java.net.URI;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    Button yellowButton;
    Button redButton;
    ParseObject LEDcmd;
    ConstraintLayout backgroundLayout;
    ParseQuery<ParseObject> query;
    String rLED;
    String yLED;
    Boolean connected = true;

    ParseLiveQueryClient parseLiveQueryClient = null;

    @Override
    public void onClick(View view) {
        checkConnection();
        if (connected) {
            if (view.getId() == R.id.yellowButton) {
                if (yLED.equals("OFF")) {
                    yLED = "ON";
                } else {
                    yLED = "OFF";
                }

            } else if (view.getId() == R.id.redButton) {
                if (rLED.equals("OFF")) {
                    rLED = "ON";
                } else {
                    rLED = "OFF";
                }

            }

            redButton.setClickable(false);
            yellowButton.setClickable(false);

            query = ParseQuery.getQuery("LED_cmd");
            query.getInBackground("C2z8VXFK7y", new GetCallback<ParseObject>() {
                @Override
                public void done(ParseObject object, ParseException e) {
                    if (e == null && object != null) {
                        object.put("R_LED", rLED);
                        object.put("Y_LED", yLED);

                        object.saveInBackground(new SaveCallback() {
                            @Override
                            public void done(ParseException e) {
                                if (e == null) {
                                    redButton.setClickable(true);
                                    yellowButton.setClickable(true);
                                    updateBackgroundColor();
                                } else {
                                    e.printStackTrace();
                                    Toast.makeText(MainActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
                                }
                            }
                        });
                    }
                }
            });
        }

    }

    public void checkConnection() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState() == NetworkInfo.State.CONNECTED ||
                connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState() == NetworkInfo.State.CONNECTED) {
            connected = true;
        } else {
            connected = false;
            Toast.makeText(this, "Check internet connection", Toast.LENGTH_SHORT).show();
        }
    }

    public void updateBackgroundColor() {

        if (yLED.equals("OFF") && rLED.equals("OFF")) {
            backgroundLayout.setBackgroundColor(Color.parseColor("#FFFFFF"));
        } else if (yLED.equals("OFF") && rLED.equals("ON")) {
            backgroundLayout.setBackgroundColor(Color.parseColor("#8D0E0E"));
        } else if (yLED.equals("ON") && rLED.equals("OFF")) {
            backgroundLayout.setBackgroundColor(Color.parseColor("#EDFC1D"));
        } else if (yLED.equals("ON") && rLED.equals("ON")) {
            backgroundLayout.setBackgroundColor(Color.parseColor("#FA8612"));
        }

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        yellowButton = findViewById(R.id.yellowButton);
        redButton = findViewById(R.id.redButton);
        backgroundLayout = findViewById(R.id.backgroundLayout);

        setTitle("Main Page");

        /*
        //only one time
        LEDcmd = new ParseObject("LED_cmd");
        LEDcmd.put("R_LED", "OFF");
        LEDcmd.put("Y_LED", "OFF");
        LEDcmd.saveInBackground(new SaveCallback() {
            @Override
            public void done(ParseException e) {
                if (e == null) {
                    Log.i("Saving", "Successful");
                } else {
                    e.printStackTrace();
                }
            }
        });
         */

        yellowButton.setOnClickListener(this);
        redButton.setOnClickListener(this);


        checkConnection();
        if (connected) {
            query = ParseQuery.getQuery("LED_cmd");
            query.getInBackground("C2z8VXFK7y", new GetCallback<ParseObject>() {
                @Override
                public void done(ParseObject object, ParseException e) {
                    if (e == null && object != null) {
                        rLED = object.getString("R_LED");
                        yLED = object.getString("Y_LED");
                        updateBackgroundColor();
                    } else {
                        Toast.makeText(MainActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });

        }

        ParseAnalytics.trackAppOpenedInBackground(getIntent());


        Parse.initialize(new Parse.Configuration.Builder(getApplicationContext())
                .applicationId("<AppID>")
                .clientKey("<MasterKey>")
                .server("ws://<serverURL>:<PORT>")
                .build()
        );

        try {
            parseLiveQueryClient = ParseLiveQueryClient.Factory.getClient(new URI("ws://<serverURL>:<PORT>"));
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (parseLiveQueryClient != null) {
            ParseQuery<ParseObject> parseQuery = new ParseQuery<ParseObject>("Pi_GPIOs");
            parseQuery.getInBackground("P7Y9cbXYHq");
            SubscriptionHandling<ParseObject> subscriptionHandling = parseLiveQueryClient.subscribe(parseQuery);

            subscriptionHandling.handleEvent(SubscriptionHandling.Event.UPDATE, new SubscriptionHandling.HandleEventCallback<ParseObject>() {
                @Override
                public void onEvent(ParseQuery<ParseObject> query, final ParseObject object) {
                    Handler handler = new Handler(Looper.getMainLooper());
                    handler.post(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(MainActivity.this, "GPIO21 set to " + object.get("GPIO21"), Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            });

        }

    }
}
