package org.example.theme;

import javafx.scene.Parent;
import javafx.scene.Scene;
import org.example.config.AppConfigManager;

public class ThemeManager {
    private static final String THEME_KEY = "theme";
    private static String currentTheme = "dark";

    public static void setTheme(String themeName, Scene scene) {
        currentTheme = themeName;
        applyTheme(scene);
        AppConfigManager.setProperty(THEME_KEY, themeName);
    }

    public static void applyTheme(Scene scene) {
        scene.getStylesheets().clear();
        scene.getStylesheets().add(ThemeManager.class.getResource(getCssPath()).toExternalForm());
    }

    public static void applyThemeToRoot(Parent root) {
        root.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                applyTheme(newScene);
            }
        });
    }

    public static void loadThemeFromConfig(Scene scene) {
        currentTheme = AppConfigManager.getProperty(THEME_KEY, "dark");
        applyTheme(scene);
    }

    public static String getCssPath() {
        return "/ui/themes/" + currentTheme + "/" + currentTheme + ".css";
    }
}
