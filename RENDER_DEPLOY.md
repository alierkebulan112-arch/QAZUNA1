# QAZYNA → Render: орналастыру жоспары

Сайт – статикалық Vite/React жобасы (сервер қажет емес), сондықтан Render-де **Static Site** ретінде тұрады.

## 1. Git-ке салу
1. Бұл бумада `git init` (немесе бар репозиторийге көшіріңіз).
2. `git add . && git commit -m "QAZYNA: intro videos, thumbnail selector"`
3. GitHub-та жаңа репозиторий ашып, `git push`.
   - `node_modules/` пен `dist/` `.gitignore`-да бар, оларды салудың қажеті жоқ.
   - Ең ауыр файлдар: `takiya.glb` (~54 МБ), `saukele.glb` (~53 МБ). GitHub 100 МБ-қа дейін қабылдайды, бірақ 50 МБ-тан асқан файлға ескерту шығады.

## 2. Render-де жаңа жоба
1. render.com → **New +** → **Blueprint** → репозиторийді таңдаңыз (`render.yaml` автоматты оқылады).
   Не болмаса **New + → Static Site** және қолмен:
   - Build Command: `npx --yes pnpm@10 install --frozen-lockfile && npx --yes pnpm@10 run build`
   - Publish Directory: `dist`
   - Environment: `NODE_VERSION = 22.12.0`
   - Redirects/Rewrites: `/*` → `/index.html` (Rewrite)
2. **Apply / Create** басыңыз. Бірінші build 3–6 минут алады.
3. Дайын болған соң `https://qazyna.onrender.com` (аты басқа болуы мүмкін) ашылады.

## 3. Тексеру тізімі
- [ ] Бет ашылғанда алдымен видео ойнайды, біткен соң 3D модель шығады
- [ ] Төмендегі иконкаға басқанда видео → модель қайта ойналады
- [ ] Бөрікте уақытша процедуралық 3D тұр (нақты файл келгенде `src/data.ts` ішіндегі `berik` жолындағы `model` ауыстырылады)
- [ ] Телефонда бет жүктелу жылдамдығы (3D файлдар ауыр)

## 4. Кейін жақсарту (ұсыныс)
- GLB файлдарды сығу (Draco/Meshopt + WebP текстура): 40–54 МБ → шамамен 3–8 МБ. Жүктелу бірнеше есе тез болады.
- Видеолар қазір 368×368 – 1024×576. Үлкен экранда сәл бұлыңғыр көрінуі мүмкін, жоғары ажыратымдылықты нұсқасын берсе ауыстыру жеткілікті (`src/assets/video/*.mp4`).
- Өз домен: Render → Settings → Custom Domains.
