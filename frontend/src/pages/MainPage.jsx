import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/index-style.css';

function MainPage() {
    return (
        <div className="landing-page-wrapper">
            <header className="landing-header">
                <div className="landing-title-container">
                    <img src="/media/logo.png" alt="logo" className="landing-logo" />
                    <div className="landing-app-name">TheManager</div>
                </div>

                <div className="landing-auth-buttons">
                    <Link to="/login">
                        <button className="btn-login">Zaloguj się</button>
                    </Link>
                    <Link to="/register">
                        <button className="btn-register">Zarejestruj się</button>
                    </Link>
                </div>
            </header>

            <main className="landing-content">
                <section className="landing-section">
                    <div className="text-content">
                        <h1>Efektywne przydzielanie zadań</h1>
                        <p className="description">
                            TheManager pozwala w prosty sposób przypisywać zadania pracownikom, śledzić ich postępy i priorytety.

                            Dzięki przejrzystemu interfejsowi każdy członek zespołu dokładnie wie, co ma robić i w jakim czasie.
                            Unikasz chaosu i nadmiernego obciążenia pracowników – wszystkie zadania są w jednym miejscu.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src="https://media.istockphoto.com/id/1254287193/vector/illustration-of-two-business-colleagues-analyzing-financial-data.jpg?s=612x612&w=0&k=20&c=x4AoOLwM1JOMSDj_t2o_ezIFJe4jwvWZfEWFK3LbBCw=" alt="Colleagues analyzing data" />
                    </div>
                </section>

                <section className="landing-section reverse-layout">
                    <div className="image-content">
                        <img src="https://media.istockphoto.com/id/1280280320/vector/financial-statements-analysis-implementing-business-solutions-scaling-your-business.jpg?s=612x612&w=0&k=20&c=FbmiznzPGeBCzO34OENRwT0HvcPA0CHEauZc2jmbhzg=" alt="Business solutions" />
                    </div>
                    <div className="text-content">
                        <h1>Płynny i wydajny proces pracy</h1>
                        <p className="description">
                            Aplikacja analizuje przepływ pracy w Twojej firmie i sugeruje optymalne kolejności działań.
                            Możesz identyfikować obszary wymagające dodatkowego wsparcia i automatyzować powtarzalne procesy.
                            Dzięki temu Twój zespół pracuje szybciej i sprawniej.
                        </p>
                    </div>
                </section>

                <section className="landing-section">
                    <div className="text-content">
                        <h1>Monitoruj postępy i podejmuj lepsze decyzje</h1>
                        <p className="description">
                            TheManager umożliwia generowanie raportów na podstawie aktualnych danych.

                            Widzisz, kto wykonuje swoje zadania efektywnie, a gdzie proces wymaga wsparcia.
                            Dzięki wizualizacjom i szczegółowym statystykom łatwiej planować zasoby i podejmować decyzje strategiczne.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src="https://media.istockphoto.com/id/1192104785/vector/business-data-analysis-data-research-strategic-planning-and-marketing.jpg?s=612x612&w=0&k=20&c=FqCUQXQGwqwSdpfRLHcxcvgjy-QhLpLTK5JZNa2DQIo=" alt="Data analysis" />
                    </div>
                </section>

                <section className="summary-section">
                    <h2 className="summary-title">Dlaczego warto wybrać TheManager?</h2>

                    <div className="summary-grid">
                        <div className="summary-card">
                            <h3>Kroki do sukcesu</h3>
                            <ol>
                                <li>Znajdź zadanie</li>
                                <li>Przypisz pracownika</li>
                                <li>Śledź postępy</li>
                                <li>Osiągaj cele</li>
                            </ol>
                        </div>

                        <div className="summary-card">
                            <h3>Cechy</h3>
                            <table className="summary-table">
                                <tbody>
                                <tr><td>Prosty</td><td>Elastyczny</td></tr>
                                <tr><td>Uniwersalny</td><td>Skalowalny</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="summary-card">
                            <h3>Korzyści</h3>
                            <ul>
                                <li>Szybkie przypisywanie</li>
                                <li>Jasne priorytety</li>
                                <li>Historia zadań</li>
                                <li>Efektywna praca</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default MainPage;