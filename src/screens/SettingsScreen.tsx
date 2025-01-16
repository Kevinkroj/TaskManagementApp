import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import '../css/SettingsScreen.css';
import '../components/i18n';  // Import i18n configuration
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

function SettingsScreen() {
    const dispatch = useDispatch();
    const { t, i18n }: any = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const users = useSelector((state: any) => state.user.users);
    const userID = localStorage.getItem('userID');
    const filteredUser = users.find((user: any) => user.id === userID);

    const loadLanguageFromLocalStorage = () => {
        const storedLanguage = localStorage.getItem('language');
        if (storedLanguage) {
            setSelectedLanguage(storedLanguage);
            i18n.changeLanguage(storedLanguage);
        } else {
            setSelectedLanguage(i18n.language);
        }
    };

    useEffect(() => {
        loadLanguageFromLocalStorage();
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value;
        setSelectedLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    return (
        <div className="settings-container">
            <h1 className="settings-title">{t('settings')}</h1>

            <div className="info-section">
                <div className="info-card">
                    <h2 className="section-title">{t('userData')}</h2>
                    <ul className="info-list">
                        <li><span className="username-email-role">{t('username')}:</span> {filteredUser?.username}</li>
                        <li><span className="username-email-role">{t('email')}:</span> {filteredUser?.email}</li>
                        <li><span className="username-email-role">{t('role')}:</span> {filteredUser?.role}</li>
                    </ul>
                </div>
            </div>

            <div className="info-section">
                <div className="info-card">
                    <h2 className="section-title">{t('infoData')}</h2>
                    <ul className="info-list">
                        <li>{t('version')}: 1.0.0</li>
                        <li>{t('buildDate')}: January 15, 2025</li>
                    </ul>
                </div>
            </div>

            <div className="info-section">
                <div className="info-card">
                    <h2 className="section-title">{t('chooseLanguage')}</h2>
                    <select
                        className="language-dropdown"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        <option value="en">{t('english')}</option>
                        <option value="fr">{t('french')}</option>
                        <option value="sq">{t('albanian')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default SettingsScreen;