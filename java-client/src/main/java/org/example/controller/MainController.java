package org.example.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import org.example.plugin.Plugin;
import org.example.plugin.PluginLoader;
import org.example.theme.ThemeManager;

import java.io.File;
import java.util.List;

public class MainController {
    @FXML private StackPane contentStack;
    @FXML private BorderPane journalPane;
    @FXML private BorderPane pluginsPane;
    @FXML private BorderPane themesPane;
    @FXML private Button journalButton;
    @FXML private Button pluginsButton;
    @FXML private Button themesButton;
    @FXML private BorderPane contentPane;
    @FXML private BorderPane mainPane;

    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(mainPane);
        journalButton.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                ThemeManager.applyTheme(newScene);
            }
        });
        loadView("/ui/journal.fxml");
        journalButton.setOnAction(e -> loadView("/ui/journal.fxml"));
        pluginsButton.setOnAction(e -> loadView("/ui/plugins.fxml"));
        themesButton.setOnAction(e -> loadView("/ui/themes.fxml"));
    }

    private void loadView(String fxmlPath) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
            Pane view = loader.load();
            view.sceneProperty().addListener((obs, oldScene, newScene) -> {
                if (newScene != null) {
                    ThemeManager.applyTheme(newScene);
                }
            });
            Parent parent = contentPane.getParent();
            if (parent instanceof Pane paneParent) {
                int index = paneParent.getChildren().indexOf(contentPane);
                if (index != -1) {
                    paneParent.getChildren().set(index, view);
                }
            }
            contentPane = (BorderPane) view;
            contentPane.setVisible(true);
            System.out.println("Vue chargée : " + fxmlPath);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void loadPlugins() {
        File pluginFolder = new File("plugins");
        if (pluginFolder.exists()) {
            File[] jars = pluginFolder.listFiles((dir, name) -> name.endsWith(".jar"));
            if (jars != null) {
                for (File jar : jars) {
                    List<Plugin> plugins = PluginLoader.loadPlugins(jar);
                    for (Plugin plugin : plugins) {
                        plugin.start();
                    }
                }
                System.out.println("Plugins charges");
            }
        }
    }
}
