package org.example.plugin;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

public class PluginLoader {

    public static List<Plugin> loadPlugins(File jarFile) {
        List<Plugin> plugins = new ArrayList<>();

        try {
            URL[] urls = { jarFile.toURI().toURL() };
            URLClassLoader loader = new URLClassLoader(urls, Plugin.class.getClassLoader());

            ServiceLoader<Plugin> serviceLoader = ServiceLoader.load(Plugin.class, loader);

            for (Plugin plugin : serviceLoader) {
                plugins.add(plugin);
                System.out.println("Loaded plugin: " + plugin.getName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return plugins;
    }
}
