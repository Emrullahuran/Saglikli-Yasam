import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    gender: '',
    height: '',
    weight: '',
    age: '',
    activityLevel: 'sedentary',
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] }
  });
  const [dailyCalorieNeed, setDailyCalorieNeed] = useState(null);
  const [calorieDeficit, setCalorieDeficit] = useState(0);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [customMeal, setCustomMeal] = useState({ name: '', calories: '', quantity: '', mealType: '' });
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const aboutRef = useRef(null);
  const missionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const calculateCalorieNeed = () => {
    const { gender, age, height, weight, activityLevel } = userData;
    if (!gender || !age || !height || !weight) return;
    const bmr = gender === 'erkek'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };
    const calorieNeed = Math.round(bmr * activityMultipliers[activityLevel]);
    setDailyCalorieNeed(calorieNeed);
    setCalorieDeficit(calorieNeed);
  };

  const calculateWeightLoss = () => {
    const dailyDeficit = calorieDeficit;
    const periods = [
      { name: '1 Ay', days: 30 },
      { name: '3 Ay', days: 90 },
      { name: '6 Ay', days: 180 },
      { name: '1 Yıl', days: 365 }
    ];
    return periods.map(period => ({
      name: period.name,
      weightLoss: ((dailyDeficit * period.days) / 7700).toFixed(1)
    }));
  };

  const handleUserDataSubmit = (e) => {
    e.preventDefault();
    const { age, height, weight } = userData;
    if (parseInt(age) <= 0 || parseInt(height) <= 0 || parseInt(weight) <= 0) {
      setErrorMessage('Yaş, boy ve kilo 0\'dan büyük olmalıdır.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }
    calculateCalorieNeed();
    setStep(2);
  };

  const foodOptions = {
    breakfast: {
      foods: [
        { id: 'haslanmis_yumurta', name: 'Haşlanmış Yumurta', calories: 70, desc: '1 adet, 6g protein, 0.6g karbonhidrat, 5g yağ. Yüksek protein, tokluk sağlar.', img: 'egg.png', type: 'Yemek' },
        { id: 'yulaf', name: 'Yulaf Ezmesi', calories: 150, desc: '40g, sütsüz, 7g protein, 27g karbonhidrat, 3g yağ. Lif zengini, sindirimi destekler.', img: 'oats.png', type: 'Yemek' },
        { id: 'cavdar_ekmegi', name: 'Çavdar Ekmeği', calories: 75, desc: '1 dilim (30g), 2.5g protein, 14g karbonhidrat, 0.5g yağ. Lif zengini, düşük glisemik indeks.', img: 'cavdar.png', type: 'Yemek' },
        { id: 'kepek_ekmegi', name: 'Kepek Ekmeği', calories: 70, desc: '1 dilim (30g), 3g protein, 12g karbonhidrat, 0.7g yağ. Tok tutar, sindirime yardımcı.', img: 'kepek.png', type: 'Yemek' },
        { id: 'tam_bugday_ekmegi', name: 'Tam Buğday Ekmeği', calories: 80, desc: '1 dilim (30g), 3g protein, 15g karbonhidrat, 1g yağ. Lif ve vitamin kaynağı.', img: 'tambugday.png', type: 'Yemek' },
        { id: 'lor_peyniri', name: 'Lor Peyniri', calories: 90, desc: '50g, 11g protein, 2g karbonhidrat, 3g yağ. Düşük yağ, yüksek protein.', img: 'lor.png', type: 'Yemek' },
        { id: 'avokado', name: 'Avokado', calories: 120, desc: '50g, 1g protein, 4g karbonhidrat, 11g yağ. Sağlıklı yağlar, vitamin zengini.', img: 'avocado.png', type: 'Yemek' },
        { id: 'domates', name: 'Domates', calories: 20, desc: '100g, 1g protein, 4g karbonhidrat, 0.2g yağ. Antioksidan, düşük kalori.', img: 'tomato.png', type: 'Yemek' },
        { id: 'zeytin', name: 'Siyah Zeytin', calories: 60, desc: '10 adet (30g), 0.5g protein, 2g karbonhidrat, 5g yağ. Sağlıklı yağ kaynağı.', img: 'olive.png', type: 'Yemek' },
        { id: 'beyaz_peynir', name: 'Light Beyaz Peynir', calories: 80, desc: '30g, 6g protein, 1g karbonhidrat, 5g yağ. Kalsiyum ve protein kaynağı.', img: 'lightpeynir.png', type: 'Yemek' }
      ],
      drinks: [
        { id: 'yesil_cay', name: 'Yeşil Çay', calories: 0, desc: '1 bardak (240ml), 0g protein, 0g karbonhidrat, 0g yağ. Antioksidan, metabolizmayı hızlandırır.', img: 'tea.png', type: 'İçecek' },
        { id: 'light_sut', name: 'Light Süt', calories: 90, desc: '200ml, 7g protein, 10g karbonhidrat, 2g yağ. Kalsiyum ve protein kaynağı.', img: 'milk.png', type: 'İçecek' },
        { id: 'maden_suyu', name: 'Sade Maden Suyu', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Minerallerle hidrasyon sağlar.', img: 'soda.png', type: 'İçecek' }
      ]
    },
    lunch: {
      foods: [
        { id: 'tavuk_izgara', name: 'Izgara Tavuk Göğsü', calories: 165, desc: '100g, 31g protein, 0g karbonhidrat, 3.6g yağ. Yüksek protein, düşük yağ.', img: 'chicken.png', type: 'Yemek' },
        { id: 'yesil_salata', name: 'Yeşil Salata', calories: 30, desc: '150g, sosuz, 1g protein, 5g karbonhidrat, 0.3g yağ. Vitamin ve lif zengini.', img: 'salad.png', type: 'Yemek' },
        { id: 'cavdar_ekmegi', name: 'Çavdar Ekmeği', calories: 75, desc: '1 dilim (30g), 2.5g protein, 14g karbonhidrat, 0.5g yağ. Lif zengini, düşük glisemik indeks.', img: 'cavdar.png', type: 'Yemek' },
        { id: 'kepek_ekmegi', name: 'Kepek Ekmeği', calories: 70, desc: '1 dilim (30g), 3g protein, 12g karbonhidrat, 0.7g yağ. Tok tutar, sindirime yardımcı.', img: 'kepek.png', type: 'Yemek' },
        { id: 'tam_bugday_ekmegi', name: 'Tam Buğday Ekmeği', calories: 80, desc: '1 dilim (30g), 3g protein, 15g karbonhidrat, 1g yağ. Lif ve vitamin kaynağı.', img: 'tambugday.png', type: 'Yemek' },
        { id: 'mercimek_corbasi', name: 'Mercimek Çorbası', calories: 120, desc: '200g, 7g protein, 20g karbonhidrat, 1g yağ. Lif ve protein kaynağı.', img: 'lentilsoup.png', type: 'Yemek' },
        { id: 'bulgur_pilavi', name: 'Bulgur Pilavı', calories: 100, desc: '100g, 3g protein, 19g karbonhidrat, 0.5g yağ. Lif zengini, düşük glisemik indeks.', img: 'bulgur.png', type: 'Yemek' },
        { id: 'kabak_sote', name: 'Kabak Sote', calories: 50, desc: '100g, 1g protein, 7g karbonhidrat, 2g yağ. Düşük kalori, vitamin zengini.', img: 'zucchini.png', type: 'Yemek' },
        { id: 'mantar_sote', name: 'Mantar Sote', calories: 60, desc: '100g, 3g protein, 6g karbonhidrat, 2g yağ. Düşük kalori, lif kaynağı.', img: 'mushroom.png', type: 'Yemek' },
        { id: 'fava', name: 'Fava', calories: 110, desc: '100g, 6g protein, 15g karbonhidrat, 3g yağ. Protein ve lif zengini.', img: 'fava.png', type: 'Yemek' }
      ],
      drinks: [
        { id: 'ayran', name: 'Ayran', calories: 80, desc: '200ml, 4g protein, 6g karbonhidrat, 3g yağ. Probiyotik, sindirime yardımcı.', img: 'ayran.png', type: 'İçecek' },
        { id: 'limonata_sugarfree', name: 'Şekersiz Limonata', calories: 10, desc: '200ml, 0g protein, 2g karbonhidrat, 0g yağ. C vitamini kaynağı.', img: 'lemonade.png', type: 'İçecek' },
        { id: 'kefir', name: 'Kefir', calories: 100, desc: '200ml, 6g protein, 8g karbonhidrat, 4g yağ. Probiyotik, bağışıklık güçlendirici.', img: 'kefir.png', type: 'İçecek' }
      ]
    },
    dinner: {
      foods: [
        { id: 'balik_firin', name: 'Fırın Somon', calories: 180, desc: '100g, 20g protein, 0g karbonhidrat, 10g yağ. Omega-3, kalp dostu.', img: 'salmon.png', type: 'Yemek' },
        { id: 'brokoli', name: 'Haşlanmış Brokoli', calories: 35, desc: '100g, 3g protein, 7g karbonhidrat, 0.4g yağ. Vitamin ve lif zengini.', img: 'broccoli.png', type: 'Yemek' },
        { id: 'cavdar_ekmegi', name: 'Çavdar Ekmeği', calories: 75, desc: '1 dilim (30g), 2.5g protein, 14g karbonhidrat, 0.5g yağ. Lif zengini, düşük glisemik indeks.', img: 'cavdar.png', type: 'Yemek' },
        { id: 'kepek_ekmegi', name: 'Kepek Ekmeği', calories: 70, desc: '1 dilim (30g), 3g protein, 12g karbonhidrat, 0.7g yağ. Tok tutar, sindirime yardımcı.', img: 'kepek.png', type: 'Yemek' },
        { id: 'tam_bugday_ekmegi', name: 'Tam Buğday Ekmeği', calories: 80, desc: '1 dilim (30g), 3g protein, 15g karbonhidrat, 1g yağ. Lif ve vitamin kaynağı.', img: 'tambugday.png', type: 'Yemek' },
        { id: 'kinoa', name: 'Kinoa Salatası', calories: 120, desc: '100g, 4g protein, 18g karbonhidrat, 2g yağ. Gluten içermez, protein kaynağı.', img: 'quinoa.png', type: 'Yemek' },
        { id: 'tavuk_sote', name: 'Tavuk Sote', calories: 150, desc: '100g, 20g protein, 3g karbonhidrat, 6g yağ. Yüksek protein, düşük karbonhidrat.', img: 'chickensote.png', type: 'Yemek' },
        { id: 'ispanak', name: 'Ispanak Yemeği', calories: 70, desc: '100g, 3g protein, 5g karbonhidrat, 4g yağ. Demir ve vitamin zengini.', img: 'spinach.png', type: 'Yemek' },
        { id: 'barbunya', name: 'Barbunya Pilaki', calories: 130, desc: '100g, 6g protein, 20g karbonhidrat, 2g yağ. Lif ve protein kaynağı.', img: 'barbunyapilaki.png', type: 'Yemek' },
        { id: 'sebzeli_omlet', name: 'Sebzeli Omlet', calories: 100, desc: '2 yumurta, 12g protein, 3g karbonhidrat, 5g yağ. Protein zengini, hafif yemek.', img: 'omelette.png', type: 'Yemek' }
      ],
      drinks: [
        { id: 'light_yogurt', name: 'Light Yoğurt', calories: 60, desc: '100g, 5g protein, 6g karbonhidrat, 1g yağ. Probiyotik, sindirime yardımcı.', img: 'yogurt.png', type: 'İçecek' },
        { id: 'papatya_cayi', name: 'Papatya Çayı', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Rahatlatıcı, sindirime yardımcı.', img: 'chamomile.png', type: 'İçecek' },
        { id: 'rezene_cayi', name: 'Rezene Çayı', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Sindirimi destekler.', img: 'fennel.png', type: 'İçecek' }
      ]
    },
    snack: {
      foods: [
        { id: 'badem', name: 'Badem', calories: 70, desc: '10 adet (12g), 2.5g protein, 2g karbonhidrat, 6g yağ. Sağlıklı yağlar, E vitamini.', img: 'almonds.png', type: 'Yemek' },
        { id: 'elma', name: 'Elma', calories: 95, desc: '1 orta boy (182g), 0.5g protein, 25g karbonhidrat, 0.3g yağ. Lif zengini, tokluk sağlar.', img: 'apple.png', type: 'Yemek' },
        { id: 'hurma', name: 'Hurma', calories: 20, desc: '1 adet (7g), 0.2g protein, 5g karbonhidrat, 0g yağ. Doğal şeker, enerji verir.', img: 'date.png', type: 'Yemek' },
        { id: 'cilek', name: 'Çilek', calories: 50, desc: '100g, 0.7g protein, 8g karbonhidrat, 0.3g yağ. C vitamini, antioksidan zengini.', img: 'strawberry.png', type: 'Yemek' },
        { id: 'armut', name: 'Armut', calories: 100, desc: '1 orta boy (178g), 0.7g protein, 26g karbonhidrat, 0.2g yağ. Lif zengini, sindirime yardımcı.', img: 'pear.png', type: 'Yemek' },
        { id: 'eti_form', name: 'Eti Form Diyet Bar', calories: 120, desc: '1 bar (35g), 2g protein, 20g karbonhidrat, 3g yağ. Lif zengini, atıştırmalık.', img: 'etiform.png', type: 'Yemek' },
        { id: 'yogurtlu_meyve', name: 'Light Yoğurtlu Meyve', calories: 80, desc: '100g, 4g protein, 12g karbonhidrat, 1g yağ. Probiyotik, hafif atıştırmalık.', img: 'yogurtfruit.png', type: 'Yemek' },
        { id: 'salatalik', name: 'Salatalık', calories: 15, desc: '100g, 0.7g protein, 3g karbonhidrat, 0.1g yağ. Hidrasyon sağlar, düşük kalori.', img: 'cucumber.png', type: 'Yemek' },
        { id: 'kuru_kayisi', name: 'Kuru Kayısı', calories: 30, desc: '3 adet (24g), 0.4g protein, 7g karbonhidrat, 0.1g yağ. A vitamini, lif kaynağı.', img: 'apricot.png', type: 'Yemek' },
        { id: 'grissini', name: 'Diyet Grissini', calories: 50, desc: '2 adet (12g), 1g protein, 9g karbonhidrat, 0.5g yağ. Hafif ve çıtır atıştırmalık.', img: 'grissini.png', type: 'Yemek' }
      ],
      drinks: [
        { id: 'coca_cola_zero', name: 'Coca-Cola Zero', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Şekersiz, düşük kalori.', img: 'cocacolazero.png', type: 'İçecek' },
        { id: 'bitki_cayi', name: 'Bitki Çayı', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Rahatlatıcı, kalorisiz.', img: 'herbaltea.png', type: 'İçecek' },
        { id: 'sade_su', name: 'Sade Su', calories: 0, desc: '200ml, 0g protein, 0g karbonhidrat, 0g yağ. Hidrasyon için temel içecek.', img: 'water.png', type: 'İçecek' }
      ]
    }
  };

  const handleMealAction = (mealType, food, parsedQuantity) => {
    const existingMealIndex = userData.meals[mealType].findIndex(item => item.id === food.id);
    let newMeals;
    if (existingMealIndex >= 0) {
      newMeals = [...userData.meals[mealType]];
      newMeals[existingMealIndex] = { ...newMeals[existingMealIndex], quantity: parsedQuantity };
      setUpdateMessage('Ürün başarıyla güncellendi');
    } else {
      newMeals = [{ ...food, quantity: parsedQuantity }, ...userData.meals[mealType]];
      setUpdateMessage('Ürün başarıyla eklendi');
    }
    const updatedMeals = { ...userData.meals, [mealType]: newMeals };
    setUserData({ ...userData, meals: updatedMeals });
    const totalCaloriesConsumed = Object.values(updatedMeals).flat().reduce((sum, item) => {
      return sum + (item.calories * item.quantity);
    }, 0);
    setCalorieDeficit(dailyCalorieNeed - totalCaloriesConsumed);
    setShowFoodModal(false);
    setQuantity('');
    setUpdateMode(false);
    setErrorMessage('');
    setTimeout(() => setUpdateMessage(''), 2000);
  };

  const initiateDelete = (mealType, foodId) => {
    setFoodToDelete({ mealType, foodId });
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    const { mealType, foodId } = foodToDelete;
    const isCustom = !foodOptions[mealType]?.foods?.some(f => f.id === foodId) && !foodOptions[mealType]?.drinks?.some(f => f.id === foodId);
    const newMeals = userData.meals[mealType].filter(item => item.id !== foodId);
    const updatedMeals = { ...userData.meals, [mealType]: newMeals };
    if (isCustom) {
      setCustomMeal({ name: '', calories: '', quantity: '', mealType: '' });
    }
    setUserData({ ...userData, meals: updatedMeals });
    const totalCaloriesConsumed = Object.values(updatedMeals).flat().reduce((sum, item) => {
      return sum + (item.calories * item.quantity);
    }, 0);
    setCalorieDeficit(dailyCalorieNeed - totalCaloriesConsumed);
    setUpdateMessage('Ürün başarıyla silindi');
    setTimeout(() => setUpdateMessage(''), 2000);
    setShowConfirmDelete(false);
    setShowFoodModal(false);
    setSelectedFood(null);
    setUpdateMode(false);
  };

  const addCustomMeal = (mealType) => {
    if (!customMeal.name || !customMeal.calories) {
      setErrorMessage('Lütfen öğün adı ve kalori girin');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }
    const parsedQuantity = parseInt(customMeal.quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMessage('Lütfen geçerli bir sayı girin (0\'dan büyük olmalı)');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }
    const newMeal = {
      id: `custom_${Date.now()}`,
      name: customMeal.name,
      calories: parseInt(customMeal.calories),
      type: 'Yemek',
      img: 'ogun.png',
      quantity: parsedQuantity,
      desc: `${customMeal.name}, özel öğün`
    };
    handleMealAction(mealType, newMeal, parsedQuantity);
    setCustomMeal({ name: '', calories: '', quantity: '', mealType: '' });
    setShowCustomMealModal(false);
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const ResultPage = () => {
    setShowChat(false);
    const weightLoss = calculateWeightLoss();
    return (
      <div className="step-container">
        <div className="calorie-bar">
          <div className="calorie-info">
            <p>Günlük Kalori İhtiyacı: <span>{dailyCalorieNeed || '-'} kcal</span></p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>Kalori Açığı: <span>{calorieDeficit || '-'} kcal</span></p>
          </div>
        </div>
        <div className="result-container">
          <div className="summary-section">
            <div className="card">
              <div className="summary-block">
                <h3>Öğün Planlarım</h3>
                {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
                  <div key={meal} className="meal-block">
                    <h4>{meal === 'breakfast' ? 'Sabah Kahvaltı Seçiminiz' : meal === 'lunch' ? 'Öğle Yemeği Seçiminiz' : meal === 'dinner' ? 'Akşam Yemeği Seçiminiz' : 'Ara Öğün Seçiminiz'}</h4>
                    <ul>
                      {userData.meals[meal].length > 0 ? (
                        userData.meals[meal].map((item, index) => (
                          <li key={index}>
                            {item.name} ({item.type}) - {item.quantity} adet - <strong>{item.calories * item.quantity} kcal</strong>
                            <button onClick={() => initiateDelete(meal, item.id)} className="delete-button">Sil</button>
                          </li>
                        ))
                      ) : (
                        <li>Seçim yapılmadı</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="summary-block">
                <h3>Tahmini Kilo Kaybım (Yağ Olarak)</h3>
                <ul className="weight-loss-list">
                  {weightLoss.map((result, index) => (
                    <li key={index}>
                      <span>{result.name}:</span> Yaklaşık <strong>{result.weightLoss} kg</strong>
                    </li>
                  ))}
                </ul>
                <p className="note"><strong>Not:</strong> Bu tahminler sadece yağ kaybını içerir.</p>
              </div>
              <div className="navigation-buttons">
                <button className="submit-button center-button" onClick={() => setStep(1)}>Bilgileri Güncelle</button>
              </div>
            </div>
          </div>
          <div className="chat-section full-width">
            <div className="card">
              <ChatModal />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChatModal = () => {
    const [messages, setMessages] = useState([
      { role: 'assistant', content: 'Merhaba, Ben Diyetisyeniniz Harran, Nasıl Yardımcı Olabilirim?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
      if (!userInput.trim()) return;
      const newMessages = [...messages, { role: 'user', content: userInput }];
      setMessages(newMessages);
      setUserInput('');
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: newMessages,
            max_tokens: 300
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessages([...newMessages, { role: 'assistant', content: response.data.choices[0].message.content }]);
      } catch (error) {
        console.error('OpenRouter API Hatası:', error.response?.data || error.message);
        setMessages([...newMessages, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu. API bağlantısını kontrol edin.' }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className={step === 6 ? "chat-modal-content full-width" : "chat-modal"}>
        {step !== 6 && (
          <button className="chat-close-button" onClick={() => setShowChat(false)}>X</button>
        )}
        {step === 6 && (
          <h3 className="chat-title">Harran</h3>
        )}
        <div className="chat-container">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <span>{msg.role === 'assistant' ? 'Harran' : 'Sen'}</span>
              <p>{msg.content}</p>
            </div>
          ))}
          {isLoading && <p className="chat-loading">Yükleniyor...</p>}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Sorunuzu yazın..."
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>Gönder</button>
        </div>
      </div>
    );
  };

  const FoodModal = () => {
    if (!showFoodModal || !selectedFood) return null;
    const mealType = step === 2 ? 'breakfast' : step === 3 ? 'lunch' : step === 4 ? 'dinner' : 'snack';
    const buttonText = updateMode ? 'Güncelle' : 'Ekle';

    const handleAction = () => {
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setErrorMessage('Lütfen geçerli bir sayı girin (0\'dan büyük olmalı)');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }
      handleMealAction(mealType, selectedFood, parsedQuantity);
    };

    return (
      <div className="modal">
        <div className="modal-content food-modal extra-large-modal">
          <button className="modal-close-button" onClick={() => { setShowFoodModal(false); setSelectedFood(null); setUpdateMode(false); setQuantity(''); setErrorMessage(''); }}>X</button>
          <div className="food-modal-content">
            <img src={selectedFood.img} alt={selectedFood.name} className="food-image" />
            <div>
              <h3>{selectedFood.name}</h3>
              <p>{selectedFood.desc}</p>
              <p>{selectedFood.type}</p>
              <p>{selectedFood.calories} kcal (1 adet)</p>
              <div className="form-group">
                <label>Adet:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setQuantity(value);
                      setErrorMessage('');
                    } else {
                      setErrorMessage('Lütfen sadece sayı girin');
                      setTimeout(() => setErrorMessage(''), 2000);
                    }
                  }}
                  placeholder="Adet girin"
                  autoFocus
                />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
              </div>
              <div className="modal-buttons">
                <button className="submit-button" onClick={handleAction}>{buttonText}</button>
                {updateMode && (
                  <button className="delete-button" onClick={() => initiateDelete(mealType, selectedFood.id)}>Sil</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = () => {
    if (!showConfirmDelete) return null;
    return (
      <div className="modal">
        <div className="modal-content confirm-delete-modal">
          <h3>Emin misiniz?</h3>
          <p>Bu öğünü silmek istediğinizden emin misiniz?</p>
          <div className="modal-buttons">
            <button className="submit-button" onClick={confirmDelete}>Evet</button>
            <button className="cancel-button" onClick={() => setShowConfirmDelete(false)}>İptal</button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const mealTypes = {
      2: 'breakfast',
      3: 'lunch',
      4: 'dinner',
      5: 'snack'
    };
    const mealTitles = {
      2: 'Sabah Kahvaltı Seçiminizi Yapınız',
      3: 'Öğle Yemeğinizi Seçiniz',
      4: 'Akşam Yemeğinizi Seçiniz',
      5: 'Ara Öğün Seçiminizi Yapınız'
    };
    const mealType = mealTypes[step] || '';
    const mealTitle = mealTitles[step] || '';
    const addedMeals = userData.meals[mealType] || [];
    const defaultFoods = foodOptions[mealType]?.foods || [];
    const defaultDrinks = foodOptions[mealType]?.drinks || [];
    if (step >= 2 && step <= 5 && !mealType) return null;

    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <div className="calorie-bar">
              <div className="calorie-info">
                <p>Günlük Kalori İhtiyacı: <span>{dailyCalorieNeed || '-'} kcal</span></p>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <p>Kalori Açığı: <span>{calorieDeficit || '-'} kcal</span></p>
              </div>
              <button className="dietitian-button center-button" onClick={() => setShowChat(true)}>Harran ile Konuş</button>
            </div>
            <div className="card">
              <h2 className="section-title">Bilgilerinizi Girin</h2>
              <form onSubmit={handleUserDataSubmit} className="user-form">
                <div className="form-group">
                  <label>Cinsiyet</label>
                  <select
                    value={userData.gender}
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                    required
                  >
                    <option value="">Seçin</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadın">Kadın</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Yaş</label>
                  <input
                    type="number"
                    placeholder="Yaşınızı girin"
                    value={userData.age}
                    min="1"
                    onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Boy (cm)</label>
                  <input
                    type="number"
                    placeholder="Boyunuzu girin"
                    value={userData.height}
                    min="1"
                    onChange={(e) => setUserData({ ...userData, height: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kilo (kg)</label>
                  <input
                    type="number"
                    placeholder="Kilonuzu girin"
                    value={userData.weight}
                    min="1"
                    onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Egzersiz Düzeyi</label>
                  <select
                    value={userData.activityLevel}
                    onChange={(e) => setUserData({ ...userData, activityLevel: e.target.value })}
                  >
                    <option value="sedentary">Hareketsiz</option>
                    <option value="light">Hafif Aktif</option>
                    <option value="moderate">Orta Aktif</option>
                    <option value="active">Çok Aktif</option>
                  </select>
                </div>
                <div className="navigation-buttons">
                  <button type="submit" className="submit-button">İleri</button>
                </div>
              </form>
            </div>
          </div>
        );
      case 2:
      case 3:
      case 4:
      case 5:
        return (
          <div className="step-container">
            <div className="calorie-bar">
              <div className="calorie-info">
                <p>Günlük Kalori İhtiyacı: <span>{dailyCalorieNeed || '-'} kcal</span></p>
                {updateMessage && <div className="update-message">{updateMessage}</div>}
                <p>Kalori Açığı: <span>{calorieDeficit || '-'} kcal</span></p>
              </div>
              <button className="dietitian-button center-button" onClick={() => setShowChat(true)}>Harran ile Konuş</button>
            </div>
            <div className="card">
              <div className="meal-header">
                {step > 2 && (
                  <button onClick={handleBack} className="nav-button back">Geri</button>
                )}
                <h2 className="section-title">{mealTitle}</h2>
                <button onClick={handleNext} className="nav-button next">İleri</button>
              </div>
              <button className="add-meal-button center-button" onClick={() => { setShowCustomMealModal(true); setCustomMeal({ ...customMeal, mealType }); }}>➕</button>
              {addedMeals.length > 0 && (
                <>
                  <h3 className="meal-category">Diyete Eklenenler</h3>
                  <div className="food-grid">
                    {addedMeals.map((food) => (
                      <div
                        key={food.id}
                        className="food-item"
                        onClick={() => {
                          if (selectedFood?.id === food.id && showFoodModal) return;
                          setSelectedFood(food);
                          setQuantity(food.quantity.toString());
                          setUpdateMode(true);
                          setShowFoodModal(true);
                        }}
                      >
                        <img src={food.img} alt={food.name} className="food-img" />
                        <div>
                          <h3>{food.name}</h3>
                          <p>{food.desc}</p>
                          <p>{food.type}</p>
                          <p>{food.calories} kcal</p>
                          <p>Adet: {food.quantity}</p>
                        </div>
                        <span className="food-tick">✔</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <h3 className="meal-category">Yemekler</h3>
              <div className="food-grid">
                {defaultFoods.map((food) => (
                  <div
                    key={food.id}
                    className="food-item"
                    onClick={() => {
                      if (selectedFood?.id === food.id && showFoodModal) return;
                      const existing = userData.meals[mealType].find(item => item.id === food.id);
                      setSelectedFood(food);
                      setQuantity(existing?.quantity.toString() || '');
                      setUpdateMode(!!existing);
                      setShowFoodModal(true);
                    }}
                  >
                    <img src={food.img} alt={food.name} className="food-img" />
                    <div>
                      <h3>{food.name}</h3>
                      <p>{food.desc}</p>
                      <p>{food.type}</p>
                      <p>{food.calories} kcal</p>
                    </div>
                    {userData.meals[mealType].some(item => item.id === food.id) && <span className="food-tick">✔</span>}
                  </div>
                ))}
              </div>
              <h3 className="meal-category">İçecekler</h3>
              <div className="food-grid">
                {defaultDrinks.map((drink) => (
                  <div
                    key={drink.id}
                    className="food-item"
                    onClick={() => {
                      if (selectedFood?.id === drink.id && showFoodModal) return;
                      const existing = userData.meals[mealType].find(item => item.id === drink.id);
                      setSelectedFood(drink);
                      setQuantity(existing?.quantity.toString() || '');
                      setUpdateMode(!!existing);
                      setShowFoodModal(true);
                    }}
                  >
                    <img src={drink.img} alt={drink.name} className="food-img" />
                    <div>
                      <h3>{drink.name}</h3>
                      <p>{drink.desc}</p>
                      <p>{drink.type}</p>
                      <p>{drink.calories} kcal</p>
                    </div>
                    {userData.meals[mealType].some(item => item.id === drink.id) && <span className="food-tick">✔</span>}
                  </div>
                ))}
              </div>
            </div>
            {showCustomMealModal && (
              <div className="modal">
                <div className="modal-content custom-meal-content extra-large-modal">
                  <button className="modal-close-button" onClick={() => { setShowCustomMealModal(false); setCustomMeal({ name: '', calories: '', quantity: '', mealType: '' }); setErrorMessage(''); }}>X</button>
                  <h3>Kendiniz Öğün Ekle</h3>
                  <div className="form-group">
                    <label>Öğün Adı:</label>
                    <input
                      type="text"
                      value={customMeal.name}
                      onChange={(e) => setCustomMeal({ ...customMeal, name: e.target.value })}
                      placeholder="Öğün adını girin"
                    />
                  </div>
                  <div className="form-group">
                    <label>Kalori:</label>
                    <input
                      type="number"
                      value={customMeal.calories}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setCustomMeal({ ...customMeal, calories: value });
                          setErrorMessage('');
                        } else {
                          setErrorMessage('Lütfen sadece sayı girin');
                          setTimeout(() => setErrorMessage(''), 2000);
                        }
                      }}
                      placeholder="Kalori girin"
                    />
                    <p className="note">Eklemek istediğiniz öğünün kalorisini diyetisyenimiz Harran’a sorabilirsiniz.</p>
                  </div>
                  <div className="form-group">
                    <label>Adet:</label>
                    <input
                      type="number"
                      min="1"
                      value={customMeal.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setCustomMeal({ ...customMeal, quantity: value });
                          setErrorMessage('');
                        } else {
                          setErrorMessage('Lütfen sadece sayı girin');
                          setTimeout(() => setErrorMessage(''), 2000);
                        }
                      }}
                      placeholder="Adet girin"
                    />
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                  </div>
                  <div className="modal-buttons">
                    <button className="submit-button" onClick={() => addCustomMeal(mealType)}>Onayla</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 6:
        return <ResultPage />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          {showIntro ? (
            <>
              <span className="navbar-brand">Sağlıklı Yaşam</span>
              <div className="navbar-links">
                <button onClick={() => scrollToSection(aboutRef)} className="navbar-link">Hakkımızda</button>
                <button onClick={() => scrollToSection(missionRef)} className="navbar-link">Misyonumuz</button>
              </div>
            </>
          ) : (
            <div className="navbar-content">
              <div className="navbar-center">
                <span className="navbar-brand">Sağlıklı Yaşam</span>
                <div className="progress-bar">
                  {[1, 2, 3, 4, 5, 6].map((dot) => (
                    <div key={dot} className={`progress-dot ${step >= dot ? 'active' : ''}`}></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {showIntro ? (
        <div className="intro-screen">
          <div className="intro-content">
            <h1>HAYATINIZI DEĞİŞTİRMEYE HAZIR MISINIZ?</h1>
            <p>Kilo vermekte güçlük mü çekiyorsunuz? Gelin size özel diyet programınızı hazırlayalım.</p>
            <button onClick={() => { setShowIntro(false); setStep(1); }} className="submit-button">Hazırım</button>
          </div>
          <div className="intro-sections">
            <div className="container">
              <div className="outer-card">
                <div ref={aboutRef}>
                  <h2 className="section-title">Hakkımızda</h2>
                  <div className="card">
                    <p>Biz, Harran Üniversitesi Bilgisayar Mühendisliği Bölümü’nde 3. sınıf öğrencisi olan 3 kişilik bir ekibiz. Sağlıklı yaşamı destekleyen bu projeyi, kullanıcıların bilinçli beslenme alışkanlıkları kazanması ve kalori takibiyle hedeflerine ulaşması için geliştirdik. Ekip çalışmamız ve yapay zeka entegrasyonu ile kullanıcılarımıza kişiselleştirilmiş bir deneyim sunmayı amaçlıyoruz.</p>
                    <h3>Serdar Emre Yetkin</h3>
                    <p>Adana’da yaşayan Serdar, projede App companent'in geliştirilmesinde önemli bir rol oynadı. Backend mantığını oluşturarak uygulamanın akıcı ve kullanıcı dostu olmasını sağladı. Serdar, kod yazarken detaylara dikkat eden bir geliştirici.</p>
                    <h3>Emrullah Uran</h3>
                    <p>Mardin’de yaşayan Emrullah, projenin CSS ve arayüz tasarımından sorumluydu. Kullanıcı dostu ve modern bir tasarım oluşturmak için titizlikle çalıştı. Emrullah’ın görsel estetik anlayışı, uygulamamızın şık ve profesyonel görünmesini sağladı.</p>
                    <h3>Muhammed Musab Şahin</h3>
                    <p>İzmir’de yaşayan Musab, Serdar ile birlikte App companent'in geliştirilmesinde çalıştı. Frontend ve backend entegrasyonunda kritik görevler üstlendi. Musab’ın problem çözme yeteneği, projenin teknik zorluklarını aşmamızda büyük katkı sağladı.</p>
                    <p>Ekip olarak, OpenRouter’ın ücretsiz API’sini entegre ederek yapay zeka destekli diyetisyenimiz Harran’ı hayata geçirdik. Her birimiz projenin farklı yönlerinde çalışarak, sağlıklı yaşamı herkes için erişilebilir kılmayı hedefledik.</p>
                  </div>
                </div>
                <div ref={missionRef}>
                  <h2 className="section-title">Misyonumuz</h2>
                  <div className="card">
                    <p>Biz, sağlıklı yaşamı herkes için erişilebilir kılmayı hedefliyoruz. Teknolojiyi kullanarak bireylerin yaşam tarzlarını iyileştirmelerine yardımcı olmak istiyoruz. Bu uygulama ile kullanıcıların bilinçli beslenme alışkanlıkları kazanmasını ve kalori takibi yaparak hedeflerine ulaşmasını amaçlıyoruz. Yapay zeka destekli diyetisyenimiz Harran, OpenRouter API’si ile entegre edilerek kişiselleştirilmiş öneriler sunar. Yapay zekanın bu projedeki önemi, karmaşık verileri analiz ederek kullanıcılara en uygun diyet planlarını hızlıca oluşturması ve sürekli öğrenerek kendini geliştirmesidir.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderStep()}
          <FoodModal />
          {showChat && step !== 6 && <ChatModal />}
          {showConfirmDelete && <ConfirmDeleteModal />}
        </>
      )}
    </div>
  );
}

export default App;