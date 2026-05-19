<!-- 헤더 -->
<div align="center">

# 팜-므파탈 (Farm-me Fatale)

**식물이 죽지 않도록 함께하는 AI 홈 가드닝 플랫폼**

재배 환경 분석 · 자동 관수 · AI 일일 리포트 · 병해충 진단

[![배포](https://img.shields.io/badge/배포-Vercel-000000?style=flat-square&logo=vercel)](https://smartfarm-fe.vercel.app)
[![백엔드](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://render.com)
[![라이선스](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE) 

아주대학교 2026-1 미디어프로젝트 | TEAM Root Node

</div>

---

## 왜 만들었나요?

홈가드닝 인구는 늘고 있지만 초보자 대부분이 식물 관리를 포기합니다. 벌레가 생겨도 어떻게 해야 할지 모르고, 언제 물을 줘야 할지, 환기를 해야 할지 직접 판단하기 어렵기 때문입니다.

기존 스마트팜 솔루션은 고가의 IoT 장비가 필수라 일반 가정에서 도입하기 어렵고, 타깃도 전문 농업인에 맞춰져 있습니다.

**팜-므파탈은 장비 없이도 소프트웨어만으로 스마트팜 환경을 시뮬레이션하고, AI가 식물 관리를 대신 도와줍니다.**

---

## 데모

🌐 **[smartfarm-fe.vercel.app](https://smartfarm-fe.vercel.app)**

---

## 기능 소개

<table>
<tr>
<td width="50%">

**🌱 맞춤형 식물 추천**

햇빛·벌레 민감도·베란다 방향을 입력하면 Gemini AI가 조건에 맞는 식물을 추천하고 이유를 자연어로 설명합니다. 추천 결과에서 바로 온실 등록으로 연결됩니다.

</td>
<td width="50%">

**💧 자동 관수 룰엔진**

온도·습도·토양수분·조도 센서 데이터를 실시간 수집하고, IF-THEN 룰엔진이 펌프·환기팬·LED를 자동 제어합니다. 비 예보 시 관수를 자동으로 건너뛰고 SunCalc로 일출·일몰을 계산해 LED도 알아서 켜집니다.

</td>
</tr>
<tr>
<td width="50%">

**📋 Gemini AI 일일 리포트**

매일 오후 8시, 하루 센서 데이터를 집계해 Gemini AI가 건강 요약과 행동 추천을 생성합니다. 온도·습도 조건 기반 병해충 위험도도 함께 제공되며 채팅 스타일 UI로 친근하게 전달됩니다.

</td>
<td width="50%">

**🔬 병해충 진단 AI 모델**

잎 사진 한 장을 업로드하면 팀이 직접 학습한 ResNet18 모델이 질병 여부와 신뢰도를 즉시 반환합니다. 외부 API 없이 자체 FastAPI 서버로 독립 배포해 운영합니다.

</td>
</tr>
</table>

### 자동 제어 시나리오

| 상황 | 조건 | 동작 |
|------|------|------|
| 토양 건조 | 토양수분 < 임계값 | 펌프 ON |
| 습도 과다 | 습도 > 임계값 | 창문 OPEN |
| 빛 부족 | 태양 고도 < 기준 | LED ON |
| 병해충 위험 | 온도·습도 동시 초과 | 경보 알림 |
| 비 예보 | 강수 확률 ≥ 50% (실외) | 관수 스킵 |
| 저온 감지 | 온도 < 최솟값 | 창문 CLOSE + 알림 |

---

## 기술 구성

```
사용자 (React + Vercel)
    │
    ├── Supabase Auth  →  이메일 / Google / Kakao 로그인
    │
    └── Node.js Backend (Render)
            │
            ├── MQTT Subscribe  ←  Mosquitto Broker  ←  가상 센서 / 실제 센서
            │
            ├── 룰엔진  →  자동 관수 · 환기 · LED · 병해충 경보
            │
            ├── OpenWeather API  →  10분 주기 기상 수집
            │
            ├── 농사로 공공데이터 API  →  식물 DB 동기화
            │
            ├── Gemini AI  →  일일 리포트 · 식물 추천 이유 · 채팅 답변
            │
            └── Python AI 서버 (FastAPI + ResNet18)
                    →  병해충 이미지 분류
```

**사용 기술**

| 영역 | 스택 |
|------|------|
| Frontend | React, Vercel |
| Backend | Node.js, Express, Supabase PostgreSQL, Render |
| IoT | MQTT, Mosquitto Broker |
| AI/ML | ResNet18 (PyTorch), FastAPI, Google Colab |
| External | Gemini API, Ajou LLM API, OpenWeather API, 농사로 API, AI Hub |
| Auth | Supabase Auth, Google OAuth, Kakao OAuth |

---

## AI 서버

병해충 진단 모델은 별도 레포지토리에서 관리합니다.

> 🔗 [python-smartfarm-ai-server](https://github.com/juunghaa/python-smartfarm-ai-server)

AI Hub 식물 병충해 이미지 데이터셋([147번](https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=data&dataSetSn=147))을 기반으로 ResNet18 전이학습 Binary Classification 모델을 Google Colab에서 직접 학습했습니다. 학습된 모델은 FastAPI 서버로 배포되어 백엔드와 REST API로 통신합니다.

---

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env

# Mosquitto 브로커 실행
mosquitto

# 서버 실행
node server.js

# 가상 센서 실행 (별도 터미널)
node publisher.js
```

### 환경변수

```env
PORT=3000

DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

MQTT_URL=mqtt://localhost:1883
SENSOR_TOPIC=farm/+/sensor
ENABLE_MQTT=true

OPENWEATHER_API_KEY=your_key
GEMINI_API_KEY=your_key
NONGSARO_API_KEY=your_key

AI_SERVER_URL=https://python-smartfarm-ai-server.onrender.com
```

---

## DB 구조

```
greenhouses      온실 설정 (식물 종류, 위치, 좌표, user_id)
sensor_readings  센서 데이터 (온도, 습도, 토양수분, 조도)
actuator_logs    제어 이벤트 로그 (관수, 환기, LED)
weather_logs     외부 기상 데이터 (10분 주기)
alert_logs       룰엔진 알림 로그
daily_reports    Gemini AI 일일 리포트
plants           식물 정보 DB (농사로 API 연동)
user_plants      사용자 등록 식물
disease_logs     질병 분석 이력 (ResNet18 결과)
```

---

## API 엔드포인트

모든 요청에 `Authorization: Bearer {token}` 헤더가 필요합니다.

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 이메일 회원가입 |
| POST | `/api/auth/login` | 이메일 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 |
| GET | `/api/greenhouse` | 온실 설정 조회 |
| POST | `/api/greenhouse` | 온실 등록·수정 |
| GET | `/api/latest` | 최신 센서 데이터 |
| GET | `/api/history` | 시계열 센서 이력 |
| GET | `/api/alerts` | 알림 로그 |
| POST | `/api/control` | 수동 디바이스 제어 |
| POST | `/api/plant/recommend` | 식물 추천 |
| POST | `/api/plant/register` | 식물 등록 |
| GET | `/api/reports/today` | 오늘 리포트 |
| GET | `/api/reports` | 리포트 이력 |
| POST | `/api/disease/analyze` | 병해충 이미지 분석 |
| GET | `/api/disease/history` | 분석 이력 |

---

## 팀

| 이름 | 학과 | 역할 |
|------|------|------|
| 김효정 | 디지털미디어학과 | Frontend |
| 김정하 | 소프트웨어학과 | Backend · AI |

지도교수: 고욱 교수님 (디지털미디어학과)
자문: 제민욱 멘토님 (PROJECT PLUTO)

---

<div align="center">

MIT License © 2026 Team Root Node

</div>
