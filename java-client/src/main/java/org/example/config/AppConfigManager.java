package org.example.config;

import java.io.*;
import java.util.Properties;

public class AppConfigManager {
    private static final String CONFIG_PATH = "config.properties";
    private static final Properties props = new Properties();

    static {
        try {
            File file = new File(CONFIG_PATH);
            if (file.exists()) {
                try (InputStream in = new FileInputStream(file)) {
                    props.load(in);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getProperty(String key, String defaultValue) {
        return props.getProperty(key, defaultValue);
    }

    public static boolean getBoolean(String key, boolean defaultValue) {
        return Boolean.parseBoolean(props.getProperty(key, Boolean.toString(defaultValue)));
    }

    public static void setProperty(String key, String value) {
        props.setProperty(key, value);
        save();
    }

    public static void setBoolean(String key, boolean value) {
        setProperty(key, Boolean.toString(value));
    }

    public static void remove(String key) {
        props.remove(key);
        save();
    }

    private static void save() {
        try (OutputStream out = new FileOutputStream(CONFIG_PATH)) {
            props.store(out, null);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
