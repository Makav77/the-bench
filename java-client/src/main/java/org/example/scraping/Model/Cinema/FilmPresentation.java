package org.example.scraping.Model.Cinema;

import org.example.scraping.Scraper;

import java.util.ArrayList;
import java.util.List;

public class FilmPresentation {
    public String titre;
    public String lien;
    public String imageUrl;
    public String genres;
    public String dateSortie;
    public String duree;
    public String realisateur;
    public String acteurs;
    public String synopsis;
    public List<Seance> seances = new ArrayList<>();
}