package org.example.application;

import org.example.Main;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class AppUtils {
    public static void restartApp() {
        try {
            String javaBin = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
            File currentJar = new File(Main.class.getProtectionDomain().getCodeSource().getLocation().toURI());

            if (!currentJar.getName().endsWith(".jar")) {
                System.out.println("Not running from a JAR. Restart is skipped.");
                return;
            }

            List<String> command = new ArrayList<>();
            command.add(javaBin);
            command.add("-jar");
            command.add(currentJar.getPath());

            new ProcessBuilder(command).start();
            System.exit(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
