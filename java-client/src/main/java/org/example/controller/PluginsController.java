package org.example.controller;

import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import org.example.theme.ThemeManager;

public class PluginsController {
    @FXML private BorderPane pluginsPane;
    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(pluginsPane);
        System.out.println("Vue Plugins chargée !");
    }
}
