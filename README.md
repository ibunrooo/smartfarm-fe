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

**📋 Gemini AI 일일 리포트 + 채팅**

매일 오후 8시, 하루 센서 데이터를 집계해 Gemini AI가 건강 요약과 행동 추천을 생성합니다. 채팅 UI로 식물에 관한 질문을 하면 현재 센서 데이터 기반 맞춤 답변을 즉시 제공합니다.

</td>
<td width="50%">

**🔬 병해충 진단 AI 모델**

잎 사진 한 장을 업로드하면 팀이 직접 학습한 ResNet18 모델이 질병 여부와 신뢰도를 즉시 반환합니다. 외부 API 없이 자체 FastAPI 서버로 독립 배포해 운영합니다.

</td>
</tr>
<tr>
<td width="50%">

**🔔 Web Push 알림**

VAPID 기반 Web Push 표준을 사용해 Firebase 없이 브라우저 푸시 알림을 구현했습니다. 일일 리포트 생성 시 자동 알림이 발송되며, 구독 등록·해제·테스트를 지원합니다.

</td>
<td width="50%">

**📡 실제 IoT 기기 연동**

아두이노 등 실제 센서 기기를 등록·프로비저닝해 MQTT로 연결할 수 있습니다. 가상 센서 시뮬레이션과 실제 센서 모드를 자유롭게 전환할 수 있습니다.

</td>
</tr>
</table>

### 자동 제어 시나리오

| 상황 | 조건 | 동작 |
|------|------|------|
| 토양 건조 | 토양수분 < 임계값 | 펌프 ON |
| 습도 과다 | 습도 > 임계값 | 창문 OPEN |
| 빛 부족 | 태양 고도 < 기준 (SunCalc) | LED ON |
| 병해충 위험 | 온도·습도 동시 초과 | 경보 알림 |
| 비 예보 | 강수 확률 ≥ 50% (실외) | 관수 스킵 |
| 저온 감지 | 온도 < 최솟값 | 창문 CLOSE + 알림 |

---

## 기술 구성

```
사용자 (React + Vercel)
    │
    ├── Supabase Auth  →  이메일 / Google 로그인
    ├── 카카오 커스텀 OAuth  →  백엔드 JWT 발급
    ├── Web Push 구독  →  VAPID 기반 브라우저 알림
    │
    └── Node.js Backend (Render)
            │
            ├── MQTT Subscribe  ←  Mosquitto Broker
            │       ├── 가상 센서 시뮬레이터 (publisher.js)
            │       └── 실제 IoT 기기 (아두이노 등)
            │
            ├── 룰엔진  →  관수 · 환기 · LED · 병해충 경보
            │
            ├── OpenWeather API  →  10분 주기 기상 수집
            │
            ├── 농사로 공공데이터 API  →  식물 DB 동기화
            │
            ├── Gemini AI + Ajou LLM  →  리포트 · 추천 이유 · 채팅
            │
            ├── Web Push 발송  →  VAPID 알림
            │
            └── Python AI 서버 (FastAPI + ResNet18)
                    →  병해충 이미지 분류
```

**사용 기술**

| 영역 | 스택 |
|------|------|
| Frontend | React, Vite, Vercel |
| Backend | Node.js, Express, Supabase PostgreSQL, Render |
| IoT | MQTT, Mosquitto Broker |
| AI/ML | ResNet18 (PyTorch), FastAPI, Google Colab |
| External | Gemini API, Ajou LLM API, OpenWeather API, 농사로 API, AI Hub |
| Auth | Supabase Auth, Google OAuth, Kakao Custom OAuth |
| Push | Web Push (VAPID, Firebase 미사용) |

---

## 프로젝트 구조

```
smartfarm-backend/
├── server.js                    # 진입점
├── publisher.js                 # 가상 센서 시뮬레이터
├── src/
│   ├── app.js                   # Express 설정, 라우터 등록
│   ├── config/
│   │   └── index.js             # 환경변수
│   ├── db/
│   │   └── pool.js              # PostgreSQL 연결 풀
│   ├── middlewares/             # JWT 인증 미들웨어
│   ├── routes/
│   │   ├── auth.js              # 인증 (Supabase + Kakao OAuth)
│   │   ├── greenhouse.js        # 온실 설정 CRUD
│   │   ├── apiRoutes.js         # 센서·기상·알림 조회
│   │   ├── control.js           # 디바이스 수동 제어
│   │   ├── simulate.js          # 시뮬레이션 API
│   │   ├── plant.js             # 식물 추천·등록
│   │   ├── report.js            # 일일 리포트·채팅
│   │   ├── disease.js           # 병해충 이미지 분석
│   │   ├── push.js              # Web Push 구독·발송
│   │   ├── devices.js           # IoT 기기 등록·프로비저닝
│   │   └── alert.js             # 알림 로그
│   ├── services/
│   │   ├── authService.js       # Supabase Auth 연동
│   │   ├── mqttService.js       # MQTT 연결·수신·발행
│   │   ├── ruleEngine.js        # 자동 제어 룰 (식물 5종)
│   │   ├── weatherService.js    # OpenWeather 스케줄러
│   │   ├── reportService.js     # Gemini 리포트 생성
│   │   ├── plantService.js      # 식물 추천·농사로 연동
│   │   ├── diseaseService.js    # AI 서버 통신·질병 분석
│   │   ├── pushService.js       # Web Push 발송
│   │   └── aiService.js         # Gemini API 공통 호출
│   └── utils/
│       └── requestUtils.js      # 공통 요청 유틸
```

---

## AI 서버

병해충 진단 모델은 별도 레포지토리에서 관리합니다.

> 🔗 [python-smartfarm-ai-server](https://github.com/juunghaa/python-smartfarm-ai-server)

| 항목 | 내용 |
|------|------|
| 프레임워크 | FastAPI |
| 모델 | ResNet18 (PyTorch 전이학습) |
| 분류 | `healthy` / `disease` (Binary Classification) |
| 데이터셋 | AI Hub 식물 병충해 이미지 ([147번](https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=data&dataSetSn=147)) |
| 학습 환경 | Google Colab (GPU) |
| 배포 | Render |

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
push_subscriptions  Web Push 구독 정보
devices          IoT 기기 등록 정보
```

---

## API 엔드포인트

모든 요청에 `Authorization: Bearer <ACCESS_TOKEN>` 헤더가 필요합니다.  
온실 단위 API는 `greenhouseId` 파라미터가 필수입니다.

> 전체 명세는 [API 명세서](./API_명세서.md)를 참고하세요.

### 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/auth/me` | 현재 사용자 정보 조회 |
| GET | `/api/auth/kakao/start` | 카카오 OAuth 시작 URL 발급 |
| GET | `/api/auth/kakao/callback` | 카카오 인가 코드 콜백 |

> 이메일·Google 로그인은 Supabase Auth에서 처리합니다.

### 온실

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/greenhouses` | 내 온실 목록 조회 |
| GET | `/api/greenhouse` | 온실 상세 조회 |
| POST | `/api/greenhouse` | 온실 등록·수정 |
| DELETE | `/api/greenhouse` | 온실 삭제 (관련 데이터 일괄 삭제) |

### 센서·환경

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/latest` | 최신 센서 데이터 1건 |
| GET | `/api/history` | 시계열 센서 이력 (최대 1440분) |
| GET | `/api/actuators` | 제어 이벤트 로그 |
| GET | `/api/weather` | 최신 외부 기상 데이터 |
| GET | `/api/alerts` | 룰엔진 알림 로그 |
| POST | `/api/control` | 수동 디바이스 제어 (펌프·LED·창문) |

### 시뮬레이션

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/simulate/publish` | 센서값 1회 발행 |
| POST | `/api/simulate/start` | 주기 시뮬레이션 시작 |
| POST | `/api/simulate/stop` | 주기 시뮬레이션 중지 |

### 식물

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/plant/list` | 식물 마스터 목록 |
| POST | `/api/plant/recommend` | 환경 조건 기반 식물 추천 |
| POST | `/api/plant/register` | 식물 등록 |
| DELETE | `/api/plant/register` | 식물 등록 해제 |

### 리포트·채팅

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/reports` | 리포트 이력 조회 |
| GET | `/api/reports/today` | 오늘 리포트 |
| POST | `/api/reports/generate` | 리포트 즉시 생성 (테스트용) |
| GET | `/api/report/latest` | 최신 리포트 |
| GET | `/api/report/daily` | 날짜별 리포트 |
| POST | `/api/report/chat` | AI 채팅 (최근 10개 히스토리 지원) |

### 병해충 진단

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/disease/predict` | 이미지 업로드 → 질병 분석 (최대 5MB) |
| GET | `/api/disease/history` | 분석 이력 조회 |

### Web Push

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/push/public-key` | VAPID 공개키 조회 |
| POST | `/api/push/subscribe` | 브라우저 Push 구독 등록 |
| DELETE | `/api/push/subscribe` | 구독 해제 |
| POST | `/api/push/test` | 테스트 푸시 발송 |

### IoT 기기

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/devices` | 기기 목록 조회 |
| POST | `/api/devices/register` | 기기 등록 |
| POST | `/api/devices/:deviceId/provision` | MQTT 자격증명 발급 (1회) |
| GET | `/api/devices/:deviceId/status` | 기기 온라인 상태 확인 |
| POST | `/api/devices/:deviceId/revoke` | 자격증명 revoke |

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
VITE_API_BASE_URL=https://node-smartfarm-backend.onrender.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 팀

| 이름 | 학과 | 역할 |
|------|------|------|
| 김효정 | 디지털미디어학과 | Frontend |
| 김정하 | 소프트웨어학과 | Backend · AI |

지도교수: 고욱 교수님 (디지털미디어학과)  
자문: 제민욱 (PROJECT PLUTO)

---

<div align="center">

MIT License © 2026 Team Root Node

</div>
