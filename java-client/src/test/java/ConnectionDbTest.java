import org.example.db.DatabaseManager;
import java.sql.SQLException;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
public class ConnectionDbTest {
    @Test
    public void testGetConnection() throws SQLException {
        DatabaseManager.getConnection();
        assertTrue(DatabaseManager.connection.isValid(5));
    }

    @Test
    public void testCloseConnection() throws SQLException {
        DatabaseManager.getConnection();
        DatabaseManager.closeConnection();
        assertTrue(DatabaseManager.connection.isClosed());
    }
}
