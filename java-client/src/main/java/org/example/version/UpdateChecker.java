package org.example.version;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.regex.*;

import javafx.scene.control.Alert;
import org.json.JSONArray;
import org.json.JSONObject;

public class UpdateChecker {

    private static final String VERSION_FILE = "/version.txt";
    private static final String GITHUB_API_URL = "https://api.github.com/repos/NabilBoubekri/the-bench-client-release/releases/latest";
    private static final String DOWNLOAD_DIR = "update";

    public static void checkForUpdate() {
        try {
            String localVersion = VersionUtil.getLocalVersion();
            JSONObject release = fetchLatestRelease();

            String remoteVersion = release.getString("tag_name").trim();
            if (!remoteVersion.equals(localVersion)) {
                JSONArray assets = release.getJSONArray("assets");
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.getJSONObject(i);
                    if (asset.getString("name").endsWith(".jar")) {
                        String downloadUrl = asset.getString("browser_download_url");
                        UpdateUI.showUpdatePrompt(remoteVersion, () -> {
                            try {
                                downloadJarAndReplace(downloadUrl, remoteVersion);
                                Alert info = new Alert(Alert.AlertType.INFORMATION);
                                info.setTitle("Téléchargement terminé");
                                info.setHeaderText(null);
                                info.setContentText("La nouvelle version a été téléchargée dans le dossier 'update'.");
                                info.showAndWait();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        });
                        return;
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification de mise à jour : " + e.getMessage());
        }
    }

    private static String readLocalVersion() throws IOException {
        try (InputStream in = UpdateChecker.class.getResourceAsStream(VERSION_FILE);
             BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
            return reader.readLine().trim();
        }
    }

    private static JSONObject fetchLatestRelease() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GITHUB_API_URL))
                .header("Accept", "application/vnd.github.v3+json")
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        return new JSONObject(response.body());
    }

    private static void downloadJarAndReplace(String downloadUrl, String version) throws Exception {
        String filename = "the-bench-client-" + version + ".jar";
        Path updateDir = Paths.get(DOWNLOAD_DIR);
        if (!Files.exists(updateDir)) {
            Files.createDirectory(updateDir);
        }
        Path downloadedJar = updateDir.resolve(filename);
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(downloadUrl))
                .header("User-Agent", "JavaUpdateClient")
                .build();

        HttpResponse<Path> response = client.send(request, HttpResponse.BodyHandlers.ofFile(downloadedJar));

        if (response.statusCode() != 200) {
            throw new IOException("Échec du téléchargement : statut " + response.statusCode());
        }

        Path currentJar = Paths.get(UpdateChecker.class
                .getProtectionDomain()
                .getCodeSource()
                .getLocation()
                .toURI());

        String os = System.getProperty("os.name").toLowerCase();
        boolean isWindows = os.contains("win");

        String scriptName = isWindows ? "update.bat" : "update.sh";
        Path scriptPath = updateDir.resolve(scriptName);

        String scriptContent;
        Path tempJar = updateDir.resolve("temp.jar");

        if (isWindows) {
            scriptContent = String.format("""
                @echo off
                timeout /t 5 > nul
                echo [INFO] Copie du nouveau jar
                copy /Y "%s" "%s"
                echo [INFO] Remplacement de l'ancien jar
                move /Y "%s" "%s"
                echo [INFO] Lancement de la nouvelle version
                start "" javaw -jar "%s"
                """,
                downloadedJar.toAbsolutePath(),
                tempJar.toAbsolutePath(),
                tempJar.toAbsolutePath(),
                currentJar.toAbsolutePath(),
                currentJar.toAbsolutePath()
            );
        } else {
            scriptContent = String.format("""
                #!/bin/bash
                sleep 5
                cp "%s" "%s"
                mv "%s" "%s"
                nohup java -jar "%s" &
                """,
                downloadedJar.toAbsolutePath(),
                tempJar.toAbsolutePath(),
                tempJar.toAbsolutePath(),
                currentJar.toAbsolutePath(),
                currentJar.toAbsolutePath()
            );
        }
        Files.writeString(scriptPath, scriptContent);
        if (!isWindows) {
            scriptPath.toFile().setExecutable(true);
        }

        new ProcessBuilder(scriptPath.toAbsolutePath().toString())
                .directory(updateDir.toFile())
                .start();

        System.exit(0);
    }

}
