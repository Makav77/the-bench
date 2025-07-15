package org.example.version;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class VersionUtil {
    public static String getLocalVersion() throws IOException {
        try (InputStream in = VersionUtil.class.getResourceAsStream("/version.txt");
             BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
            return reader.readLine().trim();
        }
    }
}
