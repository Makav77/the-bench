package org.example.controller;

import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ToggleButton;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;
import org.example.application.AppUtils;
import org.example.config.AppConfigManager;
import org.example.plugin.Plugin;
import org.example.plugin.PluginLoader;
import org.example.theme.ThemeManager;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class PluginsController {
    @FXML private BorderPane pluginsPane;
    @FXML private HBox dropZone;
    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(pluginsPane);
        System.out.println("Vue Plugins chargée !");

        dropZone.setOnDragOver(event -> {
            if (event.getGestureSource() != dropZone && event.getDragboard().hasFiles()) {
                event.acceptTransferModes(javafx.scene.input.TransferMode.COPY);
            }
            event.consume();
        });

        dropZone.setOnDragEntered(event -> {
            if (event.getGestureSource() != dropZone && event.getDragboard().hasFiles()) {
                dropZone.getStyleClass().add("drag-over-highlight");
            }
            event.consume();
        });

        dropZone.setOnDragExited(event -> {
            dropZone.getStyleClass().remove("drag-over-highlight");
            event.consume();
        });

        dropZone.setOnDragDropped(event -> {
        var db = event.getDragboard();
        boolean success = false;

        if (db.hasFiles()) {
            File originalFile = db.getFiles().get(0);

            if (originalFile.getName().endsWith(".jar")) {
                File pluginsDir = new File("plugins");
                if (!pluginsDir.exists()) {
                    pluginsDir.mkdirs();
                }

                File targetFile = new File(pluginsDir, originalFile.getName());
                try {
                    Files.copy(originalFile.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

                    AppConfigManager.setBoolean("plugin." + targetFile.getName(), true);

                    List<Plugin> loadedPlugins = PluginLoader.loadPlugins(targetFile);
                    for (Plugin plugin : loadedPlugins) {
                        System.out.println("Dragged plugin loaded: " + plugin.getName());
                        plugin.start();
                    }

                        success = true;
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            event.setDropCompleted(success);
            event.consume();
        });
    }

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

    @FXML
    public void onSelectPluginClicked(javafx.event.ActionEvent actionEvent) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Plugin JAR");
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("JAR Files", "*.jar")
        );

        Window window = Window.getWindows().stream()
                .filter(Window::isShowing)
                .findFirst()
                .orElse(null);

        if (window == null) return;

        File selectedFile = fileChooser.showOpenDialog(window);

        if (selectedFile != null) {
            File pluginsDir = new File("plugins");
            if (!pluginsDir.exists()) {
                pluginsDir.mkdirs();
            }

            File targetFile = new File(pluginsDir, selectedFile.getName());
            try {
                Files.copy(selectedFile.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                AppConfigManager.setBoolean("plugin." + targetFile.getName(), true);

                List<Plugin> loadedPlugins = PluginLoader.loadPlugins(targetFile);
                for (Plugin plugin : loadedPlugins) {
                    System.out.println("Running plugin: " + plugin.getName());
                    plugin.start();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


    @FXML
    private void onManagePluginsClicked() {
        Stage manageStage = new Stage();
        manageStage.setTitle("The Bench: Manage Plugins");
        manageStage.getIcons().add(
                new javafx.scene.image.Image(getClass().getResourceAsStream("/ui/icons/app_logo_transparent.png"))
        );
        manageStage.initModality(Modality.APPLICATION_MODAL);

        VBox pluginListBox = new VBox(10);
        pluginListBox.setPadding(new Insets(15));
        pluginListBox.setStyle("-fx-background-color: #2e2e2e;");
        pluginListBox.setPrefWidth(350);

        File pluginFolder = new File("plugins");
        File[] jars = pluginFolder.listFiles((dir, name) -> name.endsWith(".jar"));

        if (jars != null && jars.length > 0) {
            for (File jar : jars) {
                String pluginKey = "plugin." + jar.getName();
                boolean isEnabled = AppConfigManager.getBoolean(pluginKey, true);

                HBox pluginRow = new HBox(10);
                pluginRow.setAlignment(Pos.CENTER_LEFT);

                Label nameLabel = new Label(jar.getName());
                nameLabel.setPrefWidth(180);
                nameLabel.setStyle("-fx-text-fill: white;");

                ToggleButton enableToggle = new ToggleButton(isEnabled ? "Enabled" : "Disabled");
                enableToggle.setSelected(isEnabled);
                enableToggle.setOnAction(e -> {
                    boolean enabled = enableToggle.isSelected();
                    enableToggle.setText(enabled ? "Enabled" : "Disabled");
                    AppConfigManager.setBoolean(pluginKey, enabled);

                    AppUtils.restartApp();
                });

                Button deleteBtn = new Button("Delete");
                deleteBtn.setStyle("-fx-text-fill: white; -fx-background-color: red;");
                deleteBtn.setOnAction(e -> {
                    boolean deleted = jar.delete();
                    if (deleted) {
                        pluginListBox.getChildren().remove(pluginRow);
                        AppConfigManager.remove(pluginKey);

                        AppUtils.restartApp();
                    } else {
                        System.out.println("Failed to delete: " + jar.getName());
                    }
                });

                pluginRow.getChildren().addAll(nameLabel, enableToggle, deleteBtn);
                pluginListBox.getChildren().add(pluginRow);
            }
        } else {
            Label noPlugins = new Label("No plugins found.");
            noPlugins.setStyle("-fx-text-fill: white;");
            pluginListBox.getChildren().add(noPlugins);
        }

        Scene scene = new Scene(pluginListBox);
        manageStage.setScene(scene);
        manageStage.setResizable(false);
        manageStage.showAndWait();
    }
}
