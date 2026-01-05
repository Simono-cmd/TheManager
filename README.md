UŻYWANE TECHNOLOGIE
-------------------



Backend:

* Node.js + Express
* Sequelize - do zarządzania bazą danych
* JWT - tokeny, obsługa logowania



Baza danych:

* SQLITE



Frontend:

* React
* Vite





INSTRUKCJA URUCHOMIENIA APLIKACJI
---------------------------------



* Wymagane jest zainstalowane środowisko Node.js oraz system operacyjny Windows



Uruchomienie:

* Otworzyć folder główny projektu
* Uruchomić plik run.bat



Plik run.bat automatycznie wykona następujące operacje:

* pobierze i zainstaluje wymagane biblioteki
* utworzy lokalną bazę danych, wypełni ją przykładowymi rekordami
* uruchomi serwer oraz aplikację w przeglądarce

  

ZAIMPLEMENTOWANE FUNKCJONALNOŚCI : WYMAGANIA PROJEKTOWE
--------------------------------------------------------



* Dodawanie, aktualizacja, usuwanie rekordów do bazy danych:



Zrealizowane w dwóch miejscach. 1 - Dashboard - wymaga zalogowania lub użycia konta gościa, można w nim modyfikować rekordy dotyczące tablic oraz zadań dla danego użytkownika.

2 - admin panel - po zalogowaniu na konto z uprawnieniami administratora i wybranie z listy rozwijanej (po najechaniu na ikonkę profilu) pozycji admin panel. W admin panel występują przyciski add, edit oraz delete



• Wyświetlanie listy wszystkich rekordów dla każdej tabeli (tylko najważniejsze kolumny)



Zrealizowane w admin panel, wymagane wcześniejsze logowanie na konto z uprawnieniami administratora i wybranie z listy rozwijanej (po najechaniu na ikonkę profilu) pozycji admin panel



• Wyświetlanie widoków szczegółowych (wszystkie kolumny + rekordy połączone relacjami)



Zrealizowane w admin panel, po kliknięciu w przycisk details. Wymagane zalogowanie na konto administratora



• Walidacja danych po stronie klienta i serwera



Po stronie klienta: formularze są weryfikowane pod względem treści i użytkownik otrzymuje błąd jeżeli coś zostanie wpisane niepoprawnie

Po stronie serwera: baza danych posiada zabezpieczenia w polach zdefiniowanych w modelach, kontrolery dodatkowo walidują przekazywane pola i zwracają błędy



• Rejestracja i logowanie (w tym niezbędne tabele bazy danych)



System obsługuje proces rejestracji i logowania. Jest ono dostępne dla niezalogowanego użytkownika po kliknięciu w przycisk login lub register na stronie głównej.

W bazie danych wykorzystywana jest tabela users, która przechowuje username, email, rolę oraz hash hasła użytkownika.

Po poprawnym zalogowaniu serwer generuje token JWT który jest wysyłany do klienta i służy do autoryzacji wszystkich kolejnych operacji po stronie aplikacji. 

Schemat logowania

Logowanie przez LoginPage -> authApi -> backend: POST login -> authRoutes -> authController (jwt generated) -> odebranie tokena przez LoginPage -> AuthContext -> token w localstorage



• Różne funkcjonalności w zależności od statusu użytkownika (zalogowany/gość) – np. tylko zalogowani

użytkownicy mogą modyfikować dane



W aplikacji są 3 role: gość, user i admin



GOŚĆ - użytkownik działa wyłącznie lokalnie na froncie, bez dostępu do bazy danych. Jego operacje nie są zapisywane w bazie, może tworzyć tylko tymczasowe tablice i zadania we własnym zakresie. Ma dostęp tylko do logowania, dashboardu i profilu. Strony do których nie ma dostępu są chronione ochronę tras przez ProtectedRoute i Router, oraz przez backend, który odrzuca operacje jeżeli nie otrzyma tokena, (authMiddleware) oraz waliduje role i pola w kontrolerach



USER -  ma dostęp do bazy danych. Może tworzyć dla siebie nowe tablice i zadania, oraz przypisywać do zadań swoich współpracowników jako task member. System weryfikuje, aby user miał dostęp tylko do swoich danych. (kontrolery) Nie ma on dostępu do zarządzania wszystkimi rekordami w bazie danych



ADMIN - admin ma prawo do zarządzania wszystkimi użytkownikami, tablicami i zadaniami. Ma pełen dostęp do bazy danych i do danych wszystkich użytkowników. Może nimi zarządzać poprzez admin panel po zalogowaniu na konto administratora



• Paginacja wyświetlanych list



Paginacja jest zaimplementowana w dwóch wariantach - server side i client side.

Server side polega na pobieraniu konkretnej ilości rekordów z serwera - poprzez obliczanie jakie rekordy przesłać w metodach w kontrolerze oraz parametry przekazywane przez api (?page=2\&limit=10). Backend wykorzystuje metodę findAndCountAll ORM Sequelize, aby zwrócić zarówno żądany wycinek danych, jak i metadane dotyczące całkowitej liczby rekordów, co pozwala na poprawne renderowanie nawigacji stronicowania w interfejsie użytkownika.

Server side jest wykorzystana w głównych tabelach w admin panel



Client side polega na pobraniu rekordów a potem wyświetleniu ich po podzieleniu na strony, przy użyciu takich metod jak getPaginatedData i renderPaginationControls, m.in. w widoku modala po kliknięciu details w panelu admina lub w widoku profilu użytkownika.

Tam, gdzie występuje bardzo dużo rekordów(tabela wszystkich rekordów) wykorzystałem server side pagination.


• Aplikacja frontendowa powinna być zbudowana jako Single Page Application



Komunikacja z serwerem odbywa się poprzez rest api w formacie json, a za nawigację między widokami bez przeładowania odpowiada react router. Ładujemy tylko jeden dokument html (index.html) a resztę renderujemy dynamicznie 





• Co najmniej 3 role użytkowników (np. zalogowany, gość, administrator) z różnymi dostępnymi

funkcjonalnościami



Mamy 3 role: gość, user i admin. Zostały omówione już wcześniej



• Wprowadzenie uprawnień na poziomie zasobu (np. klient może przeglądać tylko własne zamówienia,

menadżer może przeglądać i aktualizować tylko dane pracowników ze swojego działu)



Gość nie ma dostępu do bazy danych, działa tylko lokalnie i tworzy zadania i tablice na własne potrzeby.

User ma dostęp tylko do swoich zasobów, swoich tablic i zadań.

Admin ma dostęp do wszystkich zasobów. Może przeglądać, modyfikować i usuwać wszystkie rekordy z tabel Users, Tasks i Boards, zarządzać przypisaniem poprzez TaskMembers oraz w pełni kontroluje bazę danych





