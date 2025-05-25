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
                System.out.println("Nouvelle version disponible : " + remoteVersion);
                JSONArray assets = release.getJSONArray("assets");
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.getJSONObject(i);
                    if (asset.getString("name").endsWith(".jar")) {
                        String downloadUrl = asset.getString("browser_download_url");
                        //downloadJar(downloadUrl, remoteVersion);
                        System.out.println("Url : "+ downloadUrl + " Version : " + remoteVersion);
                        UpdateUI.showUpdatePrompt(remoteVersion, () -> {
                            /*try {
                                downloadJar(downloadUrl, remoteVersion);
                                // Optionnel : alerte après téléchargement
                                Alert info = new Alert(Alert.AlertType.INFORMATION);
                                info.setTitle("Téléchargement terminé");
                                info.setHeaderText(null);
                                info.setContentText("La nouvelle version a été téléchargée dans le dossier 'update'.");
                                info.showAndWait();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }*/
                        });
                        System.out.println("Nouvelle version téléchargée !");
                        return;
                    }
                }
            } else {
                System.out.println("L'application est à jour. (version " + localVersion + ")");
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

    private static void downloadJar(String downloadUrl, String version) throws IOException, InterruptedException {
        String filename = "the-bench-client-" + version + ".jar";
        Path updateDir = Paths.get(DOWNLOAD_DIR);
        if (!Files.exists(updateDir)) {
            Files.createDirectory(updateDir);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(downloadUrl))
                .build();

        HttpResponse<Path> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofFile(updateDir.resolve(filename)));
    }
}
