import dressThumb from './assets/thumbs/dress.webp'
import shapanThumb from './assets/thumbs/shapan.webp'
import takiyaThumb from './assets/thumbs/takiya.webp'
import vestThumb from './assets/thumbs/vest.webp'
import berikThumb from './assets/thumbs/berik.webp'
import saukeleThumb from './assets/thumbs/saukele.webp'
import dressPhoto from './assets/photos/dress.webp'
import shapanPhoto from './assets/photos/shapan.webp'
import takiyaPhoto from './assets/photos/takiya.webp'
import vestPhoto from './assets/photos/vest.webp'
import berikPhoto from './assets/photos/berik.webp'
import saukelePhoto from './assets/photos/saukele.webp'
import dressVideo from './assets/video/dress.mp4'
import shapanVideo from './assets/video/shapan.mp4'
import takiyaVideo from './assets/video/takiya.mp4'
import vestVideo from './assets/video/vest.mp4'
import berikVideo from './assets/video/berik.mp4'
import saukeleVideo from './assets/video/saukele.mp4'

export type Lang = 'kk' | 'ru' | 'en'
export type Model =
  | { kind: 'glb' | 'fbx'; url: string }
  | { kind: 'proc'; shape: 'hat' | 'robe' }

export type Item = {
  id: string
  name: Record<Lang, string>
  type: 'men' | 'women' | 'headwear' | 'bridal'
  /** фонсыз иконка (төменгі қатарда көрінеді) */
  thumb: string
  /** "Сурет" режимінде көрсетілетін сурет (инфографика) */
  photo: string
  /** "Видео" режимінде циклмен ойнайтын видео (трансформация) */
  video: string
  /** видеоның фон түсі: видео жақтауына қарай жиектері сайып кетпеуі үшін */
  videoBg: string
  /** видеоның ені / биіктігі */
  videoRatio: number
  accent: string
  model: Model
}

export const items: Item[] = [
  { id: 'shapan', name: { kk: 'Көк шапан', ru: 'Синий шапан', en: 'Blue Shapan' }, type: 'men', thumb: shapanThumb, photo: shapanPhoto, video: shapanVideo, videoBg: '#fdfdfd', videoRatio: 1, accent: '#0a6382', model: { kind: 'fbx', url: new URL('./assets/attire/vest-new.fbx', import.meta.url).href } },
  { id: 'dress', name: { kk: 'Ақ көйлек', ru: 'Белое платье', en: 'White Dress' }, type: 'women', thumb: dressThumb, photo: dressPhoto, video: dressVideo, videoBg: '#fffffc', videoRatio: 784 / 1168, accent: '#d9c5ab', model: { kind: 'glb', url: new URL('./assets/attire/model-three.glb', import.meta.url).href } },
  { id: 'vest', name: { kk: 'Қызыл камзол', ru: 'Красный камзол', en: 'Red Kamzol' }, type: 'women', thumb: vestThumb, photo: vestPhoto, video: vestVideo, videoBg: '#fdfdfd', videoRatio: 1024 / 576, accent: '#720c1f', model: { kind: 'glb', url: new URL('./assets/attire/shapan-new.glb', import.meta.url).href } },
  { id: 'berik', name: { kk: 'Қазақша бөрік', ru: 'Казахский борик', en: 'Kazakh Borik' }, type: 'headwear', thumb: berikThumb, photo: berikPhoto, video: berikVideo, videoBg: '#e5e4e5', videoRatio: 1, accent: '#12306b', model: { kind: 'glb', url: new URL('./assets/attire/berik.glb', import.meta.url).href } },
  { id: 'takiya', name: { kk: 'Жасыл тақия', ru: 'Зелёная тақия', en: 'Green Takiya' }, type: 'headwear', thumb: takiyaThumb, photo: takiyaPhoto, video: takiyaVideo, videoBg: '#edeae8', videoRatio: 1, accent: '#08613c', model: { kind: 'glb', url: new URL('./assets/attire/takiya.glb', import.meta.url).href } },
  { id: 'saukele', name: { kk: 'Сәукеле', ru: 'Саукеле', en: 'Saukele' }, type: 'bridal', thumb: saukeleThumb, photo: saukelePhoto, video: saukeleVideo, videoBg: '#ffffff', videoRatio: 576 / 864, accent: '#b0873a', model: { kind: 'glb', url: new URL('./assets/attire/saukele.glb', import.meta.url).href } },
]

export const T = {
  kk: {
    nav: ['Топтама', 'Мұра', 'Шеберлер', 'Байланыс'],
    login: 'Кіру', logout: 'Шығу', hello: 'Сәлем',
    eyebrow: 'ЖАҢА ТОПТАМА · 2026',
    h1a: 'Дәстүрдің', h1b: 'жаңа бейнесі',
    lead: 'Ұлттық нақыш пен заманауи пішін үйлескен бірегей топтама. Әр бұйым — тарих пен шеберліктің жалғасы.',
    storyBtn: 'Топтама тарихы',
    modeModel: '3D модель', modePhoto: 'Сурет', modeVideo: 'Видео', vidUnmute: 'Дыбысты қосу', vidMute: 'Дыбысты өшіру',
    replay: 'Қайта көрсету',
    stage3d: 'ИНТЕРАКТИВТІ 3D · AUTO',
    hint: 'Өзі айналады · қолмен бұрыңыз',
    choose: 'Топтаманы таңдаңыз',
    selected: 'ТАҢДАЛҒАН БҰЙЫМ',
    sound: 'Атмосфера', soundOn: 'Дыбысты өшіру', fullscreen: 'Толық экран', exitFs: 'Толық экраннан шығу',
    addCart: 'Себетке қосу', added: 'Себетке қосылды',
    loading3d: '3D модель жүктелуде', modelFail: '3D модель ашылмады',
    types: { men: 'Ерлер киімі', women: 'Әйелдер киімі', headwear: 'Бас киім', bridal: 'Үйлену киімі' },
    cart: 'Себет', cartEmpty: 'Себет бос', total: 'Жиыны', checkout: 'Тапсырыс беру',
    orderDone: 'Тапсырысыңыз қабылданды! Жақын арада хабарласамыз.',
    needLogin: 'Тапсырыс беру үшін алдымен жүйеге кіріңіз.',
    search: 'Іздеу', searchPh: 'Бұйымды іздеу…', noResults: 'Ештеңе табылмады', close: 'Жабу',
    modalTitle: 'Өткеннен — болашаққа',
    modalText: 'Топтамадағы әр ою мен пішін қазақ қолөнерінің табиғи жалғасы ретінде жаңаша сипатта ұсынылған. Барқыт, жібек және алтын түсті кесте дәстүрлі сән-салтанатты заманауи талғаммен байланыстырады.',
    storyTitle: 'Мұра', storySub: 'Ғасырлар бойы жинақталған өнер',
    story: [
      ['Ою-өрнек тілі', 'Қошқар мүйіз, құс қанаты, өсімдік өрнегі — әр ою өз мағынасын сақтайды және ұрпаққа жеткізеді.'],
      ['Қолмен тігілген', 'Шапан мен камзолдың кестесі қолмен салынады. Бір бұйымға аптаға дейін уақыт кетеді.'],
      ['Заманауи пішін', 'Дәстүрлі кесімді күнделікті және мерекелік киімге лайықтап, қазіргі талғамға бейімдейміз.'],
    ],
    mastersTitle: 'Шеберлер', mastersSub: 'Әр бұйымның артында — адам қолы',
    masters: [
      ['Кесте шеберлері', 'Алтын жіппен өрнек салу, барқыт пен жібекке кесте тігу.'],
      ['Тігіншілер', 'Шапан, камзол, көйлектің кесімі мен пішінін дәлме-дәл жасайды.'],
      ['Зергерлер', 'Сәукеле мен тақияның күміс, алтын әшекейлерін қолмен құяды.'],
    ],
    contactTitle: 'Байланыс', contactSub: 'Тапсырыс немесе сұрақ болса, жазыңыз',
    name: 'Аты-жөніңіз', email: 'Электрондық пошта', message: 'Хабарлама', send: 'Жіберу',
    sent: 'Рақмет! Хабарламаңыз жіберілді.',
    footer: '© 2026 QAZYNA · Ұлттық мұра',
    authLogin: 'Жүйеге кіру', authRegister: 'Тіркелу', password: 'Құпиясөз', password2: 'Құпиясөзді қайталаңыз',
    noAccount: 'Аккаунт жоқ па?', haveAccount: 'Аккаунт бар ма?', back: 'Басты бетке оралу',
    errFill: 'Барлық өрістерді толтырыңыз', errEmail: 'Пошта форматы дұрыс емес', errPass: 'Құпиясөз кемінде 6 таңба',
    errMatch: 'Құпиясөздер сәйкес емес', errExists: 'Бұл пошта тіркелген', errWrong: 'Пошта немесе құпиясөз қате',
    authNote: 'Демо-нұсқа: деректер тек осы браузерде сақталады.',
    welcome: 'Қош келдіңіз', menu: 'Мәзір',
  },
  ru: {
    nav: ['Коллекция', 'Наследие', 'Мастера', 'Контакты'],
    login: 'Войти', logout: 'Выйти', hello: 'Привет',
    eyebrow: 'НОВАЯ КОЛЛЕКЦИЯ · 2026',
    h1a: 'Новый облик', h1b: 'традиции',
    lead: 'Уникальная коллекция, где национальный орнамент встречается с современным кроем. Каждая вещь — продолжение истории и мастерства.',
    storyBtn: 'История коллекции',
    modeModel: '3D модель', modePhoto: 'Фото', modeVideo: 'Видео', vidUnmute: 'Включить звук', vidMute: 'Выключить звук',
    replay: 'Показать снова',
    stage3d: 'ИНТЕРАКТИВНОЕ 3D · AUTO',
    hint: 'Вращается сама · крутите вручную',
    choose: 'Выберите изделие',
    selected: 'ВЫБРАННОЕ ИЗДЕЛИЕ',
    sound: 'Атмосфера', soundOn: 'Выключить звук', fullscreen: 'Во весь экран', exitFs: 'Выйти из полного экрана',
    addCart: 'В корзину', added: 'Добавлено в корзину',
    loading3d: 'Загрузка 3D модели', modelFail: 'Не удалось открыть 3D модель',
    types: { men: 'Мужская одежда', women: 'Женская одежда', headwear: 'Головной убор', bridal: 'Свадебный наряд' },
    cart: 'Корзина', cartEmpty: 'Корзина пуста', total: 'Итого', checkout: 'Оформить заказ',
    orderDone: 'Заказ принят! Мы скоро свяжемся с вами.',
    needLogin: 'Чтобы оформить заказ, сначала войдите в аккаунт.',
    search: 'Поиск', searchPh: 'Найти изделие…', noResults: 'Ничего не найдено', close: 'Закрыть',
    modalTitle: 'Из прошлого — в будущее',
    modalText: 'Каждый узор и крой коллекции — естественное продолжение казахского ремесла в новом прочтении. Бархат, шёлк и золотая вышивка сочетают традиционную роскошь с современным вкусом.',
    storyTitle: 'Наследие', storySub: 'Искусство, накопленное веками',
    story: [
      ['Язык орнамента', 'Бараньи рога, крылья птицы, растительный узор — каждый орнамент хранит смысл и передаёт его потомкам.'],
      ['Ручная работа', 'Вышивка шапанов и камзолов наносится вручную. На одно изделие уходит до недели.'],
      ['Современный крой', 'Мы адаптируем традиционный крой для повседневной и праздничной одежды.'],
    ],
    mastersTitle: 'Мастера', mastersSub: 'За каждым изделием — человеческие руки',
    masters: [
      ['Вышивальщицы', 'Золотная вышивка по бархату и шёлку.'],
      ['Портные', 'Точный крой и посадка шапанов, камзолов и платьев.'],
      ['Ювелиры', 'Серебряные и золотые украшения для саукеле и тақия отливаются вручную.'],
    ],
    contactTitle: 'Контакты', contactSub: 'Напишите нам по поводу заказа или вопроса',
    name: 'Ваше имя', email: 'Электронная почта', message: 'Сообщение', send: 'Отправить',
    sent: 'Спасибо! Ваше сообщение отправлено.',
    footer: '© 2026 QAZYNA · Национальное наследие',
    authLogin: 'Вход', authRegister: 'Регистрация', password: 'Пароль', password2: 'Повторите пароль',
    noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?', back: 'Вернуться на главную',
    errFill: 'Заполните все поля', errEmail: 'Неверный формат почты', errPass: 'Пароль не короче 6 символов',
    errMatch: 'Пароли не совпадают', errExists: 'Эта почта уже зарегистрирована', errWrong: 'Неверная почта или пароль',
    authNote: 'Демо-версия: данные хранятся только в этом браузере.',
    welcome: 'Добро пожаловать', menu: 'Меню',
  },
  en: {
    nav: ['Collection', 'Heritage', 'Artisans', 'Contact'],
    login: 'Sign in', logout: 'Sign out', hello: 'Hi',
    eyebrow: 'NEW COLLECTION · 2026',
    h1a: 'A new look', h1b: 'for tradition',
    lead: 'A unique collection where national ornament meets modern tailoring. Every piece continues a story of history and craft.',
    storyBtn: 'Collection story',
    modeModel: '3D model', modePhoto: 'Photo', modeVideo: 'Video', vidUnmute: 'Sound on', vidMute: 'Sound off',
    replay: 'Replay intro',
    stage3d: 'INTERACTIVE 3D · AUTO',
    hint: 'Rotates on its own · drag to turn',
    choose: 'Choose a piece',
    selected: 'SELECTED PIECE',
    sound: 'Ambience', soundOn: 'Mute sound', fullscreen: 'Fullscreen', exitFs: 'Exit fullscreen',
    addCart: 'Add to cart', added: 'Added to cart',
    loading3d: 'Loading 3D model', modelFail: 'Could not open 3D model',
    types: { men: "Men's wear", women: "Women's wear", headwear: 'Headwear', bridal: 'Bridal wear' },
    cart: 'Cart', cartEmpty: 'Your cart is empty', total: 'Total', checkout: 'Place order',
    orderDone: 'Order received! We will contact you soon.',
    needLogin: 'Please sign in first to place an order.',
    search: 'Search', searchPh: 'Search pieces…', noResults: 'Nothing found', close: 'Close',
    modalTitle: 'From the past — to the future',
    modalText: 'Every ornament and cut in the collection is a natural continuation of Kazakh craft, reimagined. Velvet, silk and gold embroidery pair traditional splendour with modern taste.',
    storyTitle: 'Heritage', storySub: 'Art gathered over centuries',
    story: [
      ['Language of ornament', 'Ram horns, bird wings, plant motifs — every pattern keeps its meaning and hands it down.'],
      ['Hand-made', 'Shapan and kamzol embroidery is done by hand, taking up to a week per piece.'],
      ['Modern cut', 'We adapt traditional tailoring for everyday and festive wear.'],
    ],
    mastersTitle: 'Artisans', mastersSub: 'Behind every piece are human hands',
    masters: [
      ['Embroiderers', 'Gold-thread embroidery on velvet and silk.'],
      ['Tailors', 'Precise cut and fit for shapans, kamzols and dresses.'],
      ['Jewellers', 'Silver and gold ornaments for saukele and takiya are cast by hand.'],
    ],
    contactTitle: 'Contact', contactSub: 'Write to us about an order or a question',
    name: 'Your name', email: 'Email', message: 'Message', send: 'Send',
    sent: 'Thank you! Your message has been sent.',
    footer: '© 2026 QAZYNA · National heritage',
    authLogin: 'Sign in', authRegister: 'Create account', password: 'Password', password2: 'Repeat password',
    noAccount: 'No account yet?', haveAccount: 'Already have an account?', back: 'Back to home',
    errFill: 'Please fill in all fields', errEmail: 'Invalid email format', errPass: 'Password must be at least 6 characters',
    errMatch: 'Passwords do not match', errExists: 'This email is already registered', errWrong: 'Wrong email or password',
    authNote: 'Demo version: data is stored only in this browser.',
    welcome: 'Welcome', menu: 'Menu',
  },
}
export type Dict = typeof T.kk
