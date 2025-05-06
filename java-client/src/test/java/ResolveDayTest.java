import org.example.scraping.DayArticles;
import java.time.LocalDate;
import java.util.Locale;

import org.example.scraping.DayArticlesUtils;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;


public class ResolveDayTest {
    @Test
    public void testResolveDayNameToDateOneWeekBefore() {
        LocalDate today = LocalDate.of(2025, 4, 4); // Samedi 5 avril
        String dayName = "Dimanche";
        LocalDate expectedDate = LocalDate.of(2025, 3, 30); // Dimanche 30 mars

        LocalDate result = DayArticlesUtils.resolveDayNameToDate(dayName, today);
        assertEquals(expectedDate, result);
    }

    @Test
    public void testResolveDayNameToDateSameWeek() {
        LocalDate today = LocalDate.of(2025, 4, 4); // Samedi 5 avril
        String dayName = "Vendredi";
        LocalDate expectedDate = LocalDate.of(2025, 4, 4); // Vendredi 4 avril

        LocalDate result = DayArticlesUtils.resolveDayNameToDate(dayName, today);
        assertEquals(expectedDate, result);
    }
}
