package org.example.controller;

import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.FileChooser;
import javafx.stage.Window;
import org.example.plugin.Plugin;
import org.example.plugin.PluginLoader;
import org.example.theme.ThemeManager;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

public class PluginsController {
    @FXML private BorderPane pluginsPane;
    @FXML private HBox dropZone;
    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(pluginsPane);
        System.out.println("Vue Plugins chargée !");

        // Quand le fichier est dans la drag and drop zone
        dropZone.setOnDragOver(event -> {
            if (event.getGestureSource() != dropZone && event.getDragboard().hasFiles()) {
                event.acceptTransferModes(javafx.scene.input.TransferMode.COPY);
            }
            event.consume();
        });

        // Quand le fichier entre dans la zone : rajoute le style pour "réagir" visuellement
        dropZone.setOnDragEntered(event -> {
            if (event.getGestureSource() != dropZone && event.getDragboard().hasFiles()) {
                dropZone.getStyleClass().add("drag-over-highlight");
            }
            event.consume();
        });

        // Quand le fichier sort de la zone : supprime le style ajouté
        dropZone.setOnDragExited(event -> {
            dropZone.getStyleClass().remove("drag-over-highlight");
            event.consume();
        });

        // Quand le fichier est "jeté" dans la zone
        dropZone.setOnDragDropped(event -> {
            var db = event.getDragboard();
            boolean success = false;

            if (db.hasFiles()) {
                File file = db.getFiles().get(0);
                if (file.getName().endsWith(".jar")) {
                    List<Plugin> loadedPlugins = PluginLoader.loadPlugins(file);
                    for (Plugin plugin : loadedPlugins) {
                        System.out.println("Dragged plugin loaded: " + plugin.getName());
                        saveToPluginFolder(file);
                        plugin.start();
                    }
                    success = true;
                }
            }

            event.setDropCompleted(success);
            event.consume();
        });
    }

    // Sauvegarde le plugin dans /plugins
    private void saveToPluginFolder(File source) {
        File dest = new File("plugins", source.getName());
        if (!dest.exists()) {
            try {
                Files.copy(source.toPath(), dest.toPath());
                System.out.println("Plugin saved to plugins folder.");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // Quand le bouton "Select files" est utilisé
    @FXML
    public void onSelectPluginClicked(javafx.event.ActionEvent actionEvent) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Plugin JAR");
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("JAR Files", "*.jar")
        );

        Window window = javafx.stage.Window.getWindows().stream()
                .filter(Window::isShowing)
                .findFirst()
                .orElse(null);

        if (window == null) return;

        // Afficher la fenêtre du choix de fichiers
        File selectedFile = fileChooser.showOpenDialog(window);

        if (selectedFile != null) {
            List<Plugin> loadedPlugins = PluginLoader.loadPlugins(selectedFile);
            for (Plugin plugin : loadedPlugins) {
                System.out.println("Running plugin: " + plugin.getName());
                saveToPluginFolder(selectedFile);
                plugin.start();
            }
        }
    }
}
