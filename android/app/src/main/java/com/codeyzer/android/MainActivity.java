package com.codeyzer.android;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CodeyzerAutofillPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
