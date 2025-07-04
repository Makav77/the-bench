package org.example.theme;
import javafx.scene.Parent;
import javafx.scene.Scene;
import org.example.config.AppConfigManager;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class ThemeManager {
    private static final String CONFIG_PATH = "config.properties";
    private static final String THEME_KEY = "theme";
    public static final String DARK = "dark";
    public static final String NATURE = "nature";
    public static final String PASTEL = "pastel";

    private static final Map<String, Theme> themes = new HashMap<>();

    private static String currentTheme = "dark";

    static {
        themes.put(NATURE, new Theme("#344E41", "#3A5A40", "#A3B18A", "#DAD7CD", "#588157"));
        themes.put(DARK, new Theme("#1F1F2D", "#333F4C", "#3D4051", "#59747B", "#5D5E76"));
        themes.put(PASTEL, new Theme("#FAEDCD", "#E9EDC9", "#FEFAE0", "#D4A373", "#CCD5AE"));
    }

    public static void setTheme(String themeName, Scene scene) {
        currentTheme = themeName;
        applyTheme(scene);
        saveThemeToConfig(themeName);
    }


    public static void applyTheme(Scene scene) {
        Theme theme = themes.get(currentTheme);
        if (theme == null) {
            currentTheme = DARK;
        }
        scene.getStylesheets().clear();
        scene.getStylesheets().add(ThemeManager.class.getResource("/ui/themes/" + currentTheme + "/" + currentTheme + ".css").toExternalForm());
    }

    public static void applyThemeToRoot(Parent root) {
        root.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                applyTheme(newScene);
            }
        });
    }

    public static String getCssPath() {
        return "/ui/themes/" + currentTheme + "/" + currentTheme + ".css";
    }

    private static void saveThemeToConfig(String themeName) {
        AppConfigManager.setProperty("theme", themeName);
    }

    public static void loadThemeFromConfig(Scene scene) {
        currentTheme = AppConfigManager.getProperty("theme", "dark");
        applyTheme(scene);
    }

    public static String getCurrentTheme() {
        return currentTheme;
    }
}
