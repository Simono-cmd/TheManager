import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/index-style.css';

function MainPage() {
    return (
        <div className="landing-page">
            <header>
                <div id="title-container">
                    <img src="../assets/media/logo.png" alt="logo" id="title-picture" />
                    <div id="title">TheManager</div>
                </div>

                <div id="login-buttons">
                    <Link to="/login">
                        <button>Zaloguj się</button>
                    </Link>
                    <Link to="/register">
                        <button>Zarejestruj się</button>
                    </Link>
                </div>
            </header>

            <div className="main-grid">
                <div>
                    <h1>Efektywne przydzielanie zadań</h1>
                    <h3>TheManager pozwala w prosty sposób przypisywać zadania pracownikom, śledzić ich postępy i priorytety. Dzięki przejrzystemu interfejsowi każdy członek zespołu dokładnie wie, co ma robić i w jakim czasie. Unikasz chaosu i nadmiernego obciążenia pracowników – wszystkie zadania są w jednym miejscu, dostępne w czasie rzeczywistym.</h3>
                </div>
                <img className="main-img" src="https://media.istockphoto.com/id/1254287193/vector/illustration-of-two-business-colleagues-analyzing-financial-data.jpg?s=612x612&w=0&k=20&c=x4AoOLwM1JOMSDj_t2o_ezIFJe4jwvWZfEWFK3LbBCw=" alt="picture1" />
            </div>

            <div className="main-grid">
                <img className="main-img" src="https://media.istockphoto.com/id/1280280320/vector/financial-statements-analysis-implementing-business-solutions-scaling-your-business.jpg?s=612x612&w=0&k=20&c=FbmiznzPGeBCzO34OENRwT0HvcPA0CHEauZc2jmbhzg=" alt="picture2" />
                <div>
                    <h1>Płynny i wydajny proces pracy</h1>
                    <h3>Aplikacja analizuje przepływ pracy w Twojej firmie i sugeruje optymalne kolejności działań. Możesz identyfikować obszary wymagające dodatkowego wsparcia, skracać czas oczekiwania między zadaniami i automatyzować powtarzalne procesy. Dzięki temu Twój zespół pracuje szybciej i sprawniej, a projekty realizowane są terminowo.</h3>
                </div>
            </div>

            <div className="main-grid">
                <div>
                    <h1>Monitoruj postępy i podejmuj lepsze decyzje</h1>
                    <h3>TheManager umożliwia generowanie raportów na podstawie aktualnych danych – widzisz, kto wykonuje swoje zadania efektywnie, a gdzie proces wymaga wsparcia. Dzięki wizualizacjom i szczegółowym statystykom łatwiej planować zasoby i podejmować decyzje strategiczne, zwiększając produktywność całego zespołu.</h3>
                </div>
                <img className="main-img" src="https://media.istockphoto.com/id/1192104785/vector/business-data-analysis-data-research-strategic-planning-and-marketing.jpg?s=612x612&w=0&k=20&c=FqCUQXQGwqwSdpfRLHcxcvgjy-QhLpLTK5JZNa2DQIo=" alt="picture3" />
            </div>

            <div className="summary-grid">
                <p> Dlaczego warto wybrać TheManager?</p>
                <div>
                    <ol>
                        <li>Znajdź zadanie, które wymaga wykonania</li>
                        <li>Przypisz zadanie pracownikowi</li>
                        <li>Śledź na bieżąco proces realizacji</li>
                        <li>Zarządzanie prostsze niż kiedykolwiek!</li>
                    </ol>
                </div>

                <div>
                    <table id="summary-table">
                        <tbody>
                        <tr>
                            <td>Prosty</td>
                            <td>Elastyczny</td>
                        </tr>
                        <tr>
                            <td>Uniwersalny</td>
                            <td>Skalowalny</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <ul>
                        <li>Przypisywanie zadań pracownikom jednym kliknięciem</li>
                        <li>Ustalanie priorytetów i terminów</li>
                        <li>Śledzenie statusu wykonania</li>
                        <li>Proste planowanie - efektywna praca</li>
                        <li>Historia zadań dla każdego pracownika</li>
                    </ul>
                </div>
            </div>

            <footer>
                <div id="newsletter-container">
                    <p className="footer-text"> Zapisz się do naszego newslettera!</p>
                    <form className="newsletter-form" action="#">
                        <label htmlFor="email"></label>
                        <input type="email" id="email" placeholder="example@email.com" />
                        <button type="submit">Zapisz się!</button>
                    </form>
                </div>
            </footer>
        </div>
    );
}

export default MainPage;