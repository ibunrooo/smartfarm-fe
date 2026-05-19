# 🌱 팜-므파탈 (Farm-me Fatale)

> 공공 기상 데이터와 MQTT 기반 스마트팜 시뮬레이션 관리 플랫폼  
> “식물이 죽지 않도록 함께하는 AI 홈 가드닝 플랫폼”

<br>

## 📌 프로젝트 소개

팜-므파탈(Farm-me Fatale)은  
초보 홈가드닝 사용자도 쉽게 식물을 관리할 수 있도록 돕는  
AI 기반 스마트팜 시뮬레이션 웹 플랫폼입니다.

공공 기상 데이터와 가상 IoT 센서를 활용하여  
온실 환경을 실시간으로 모니터링하고,  
자동 관수 및 환경 제어를 시뮬레이션할 수 있습니다.

또한 AI 리포트, AI 실시간 채팅, 병해충 진단 기능을 통해  
사용자가 식물 상태를 직관적으로 이해하고 관리할 수 있도록 설계되었습니다.

<br>

## ✨ 핵심 가치

- 전문 농업 지식 없이도 식물 관리 가능
- AI 기반 맞춤형 식물 추천 및 관리 지원
- MQTT 기반 실시간 IoT 데이터 처리
- 자동 관수 및 환경 제어 시뮬레이션
- 병해충 AI 진단 및 AI 리포트 제공

<br>

## 🎯 주요 문제 정의

식물을 키우는 사용자들은 다음과 같은 문제를 겪습니다.

- 병해충 발생 시 대처 방법을 모름
- 현재 식물 상태를 정확히 판단하기 어려움
- 적절한 물주기 및 환경 관리가 어려움
- 식물 관리 정보를 지속적으로 찾기 번거로움

팜-므파탈은 이러한 문제를 해결하기 위해  
실시간 데이터 기반 식물 관리 경험을 제공합니다.

<br>

## 🛠 주요 기능

### 1️⃣ 사용자 맞춤형 식물 추천

- 재배 지역, 햇빛 환경, 반려동물 여부 등 환경 설문 입력
- 조건 기반 식물 자동 추천
- Gemini API 기반 추천 이유 자연어 생성
- 추천 식물 즉시 등록 가능

<br>

### 2️⃣ 자동 관수 및 환경 제어 시뮬레이션

- 온도 · 습도 · 토양수분 센서 데이터 실시간 수집
- MQTT 기반 실시간 데이터 처리
- 펌프 · 환기팬 · LED 자동 제어
- OpenWeather API 기반 외부 기상 데이터 반영
- 임계치 초과 시 이벤트 로그 및 경고 표시

<br>

### 3️⃣ AI 일일 리포트

- 하루 센서 데이터 자동 분석
- 건강 상태 및 환경 변화 요약
- 맞춤형 관리 및 행동 추천
- 누적 리포트 기록 조회 가능

<br>

### 4️⃣ AI 실시간 채팅

- 식물 관련 질문에 AI 기반 실시간 응답
- 현재 센서 데이터 기반 답변 제공
- 병해충 및 재배 정보 조회 가능

<br>

### 5️⃣ AI 병해충 진단

- 식물 사진 업로드 기반 병해충 분석
- ResNet18 기반 AI 모델 활용
- 질병 여부 및 신뢰도 표시
- 진단 결과 및 조치 방법 안내

<br>

## 🧱 서비스 구조

```bash
External → IoT → Backend → Frontend
```

### External
- OpenWeather API
- Gemini API

### IoT
- MQTT
- Mosquitto Broker
- Virtual Sensor

### Backend
- Node.js
- PostgreSQL
- REST API
- Render

### Frontend
- React
- Vercel

<br>

## ⚙️ 기술 스택

### Frontend
- React
- Vite
- React Router
- CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication

### IoT
- MQTT
- Mosquitto Broker

### AI
- Gemini API
- ResNet18
- FastAPI

### Deployment
- Render
- Vercel

<br>

## 📱 주요 화면

- 로그인
- 온보딩
- 메인 홈
- 센서 모니터링
- AI 일일 리포트
- AI 실시간 채팅
- AI 병해충 진단

<br>

## 🚀 기대 효과

### 사용자 측면
- 초보자도 쉽게 식물 관리 가능
- 질병 조기 감지
- 홈가드닝 성공 경험 증가

### 기술적 측면
- MQTT 기반 IoT 설계 경험 확보
- AI 모델 개발 및 배포 경험 확보
- 디지털 트윈 스마트팜 플랫폼 확장 가능성

<br>

## 🔮 향후 계획

- 실제 Arduino 센서 연동
- Supabase RLS 적용
- YOLO 기반 객체 탐지 도입
- 병해충 다중 분류 지원
- 미세먼지 · 풍속 기반 환기 시스템 추가

<br>  

## 👨‍💻 Team Root Node

| 이름 | 학과 | 역할 |
|------|------|------|
| 김효정 | 디지털미디어학과 | Frontend |
| 김정하 | 소프트웨어학과 | Backend · AI |

지도교수: 고욱 교수님 (디지털미디어학과)  
자문: 제민욱 (PROJECT PLUTO)

---

<div align="center">

MIT License © 2026 Team Root Node
