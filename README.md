# 🌿 팜-므파탈 (Farm-me Fatale)

> **재배 환경 분석부터 병해충 진단까지, 식물이 죽지 않도록 함께하는 AI 홈 가드닝 플랫폼입니다.**

<br>

## 📌 프로젝트 소개

Farm-me Fatale은 공공 기상 데이터와 MQTT 기반 가상 센서를 활용한 **스마트팜 시뮬레이션 관리 플랫폼**입니다.
고가의 하드웨어 없이도 실내·실외 식물 환경을 실시간으로 모니터링하고,
AI 기반 일일 리포트·실시간 채팅·병해충 진단을 통해 초보 홈 가드너의 식물 관리 실패를 방지합니다.

| 구분 | 내용 |
|------|------|
| 팀명 | 루트노드 (Root Node) |
| 서비스명 | 팜-므파탈 (Farm-me Fatale) |
| 개발 기간 | 2026.03 - 2026.06 |
| 소속 | 아주대학교 2026-1 미디어프로젝트 |
| 배포 | https://smartfarm-fe.vercel.app |

<br>

## 🎯 문제 정의

```
식물을 키우다 포기하는 이유
  🐛 병해충       벌레·진드기 발생 시 대처 방법을 알 수 없음
  🌬️ 통풍·습도   환기 타이밍을 직접 판단하기 어려움
  ☀️ 채광 부족   베란다 방향·계절에 따라 적정 일조량 확보가 어려움
  😓 관리 부담   바쁜 일상 속 지속적인 식물 케어가 어려움
```

> 식물을 키우는 것보다 **죽지 않게 유지하는 것**이 더 어렵다

<br>

## ✨ 핵심 가치 및 차별점

### 핵심 가치
- 전문 농업 지식 없이도 식물 관리 가능
- 룰엔진 기반 자동 제어로 식물 관리 자동화
- 리포트·채팅·병해충 진단 등 AI 기반 관리 지원

### 기존 서비스와의 차별점

| 항목 | 기존 서비스 | 팜-므파탈 |
|------|-----------|---------|
| 도입 비용 | 고가 IoT 장비 필요 | 저비용 센서 연결 or 센서 없이도 사용 가능 |
| 타깃 사용자 | 농업 종사자·기업 | 홈 가드닝 초보자 |
| 식물 관리 | 단일 작물 중심 | 식물별 별도 관리 가능 |
| AI 활용 | 제한적 | Gemini 일일 리포트 / 질병 분류 AI 모델 |
| 센서 확장성 | 전용 장비 필요 | 가상 ↔ 실제 센서 교체 가능 |
| 개인화 | 제한적 | 환경 맞춤 식물 추천 |

<br>

## 🛠️ 기술 스택

### External API
![OpenWeather](https://img.shields.io/badge/OpenWeather_API-EB6E4B?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)
![Ajou LLM](https://img.shields.io/badge/Ajou_LLM_API-0057A8?style=flat-square)
![농사로](https://img.shields.io/badge/농촌진흥청_API-2E7D32?style=flat-square)

### IoT
![MQTT](https://img.shields.io/badge/MQTT-660066?style=flat-square&logo=mqtt&logoColor=white)
![Mosquitto](https://img.shields.io/badge/Mosquitto_Broker-660066?style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)

### AI / ML
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![ResNet](https://img.shields.io/badge/ResNet18-Classification-orange?style=flat-square)
![AI Hub](https://img.shields.io/badge/AI_Hub-식물질병_데이터셋-blue?style=flat-square)

### Auth
![Supabase](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao_OAuth-FFCD00?style=flat-square&logo=kakao&logoColor=black)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br>

## 🏗️ 서비스 파이프라인

```
[01 사용자 온보딩]
  환경 입력 → 식물 추천 및 등록
        ↓
[02 MQTT 센서 데이터 수신]
  온도 · 습도 · 토양수분 · 조도
        ↓
[03 룰엔진 판단]
  식물 5종 임계값 비교 → 자동 제어 여부 결정
  (관수 / 환기 / LED / 병해충 경보 / 비 예보 스킵)
        ↓
[04 AI 처리]
  Gemini 일일 리포트 생성
  ResNet18 질병 분류 AI 수행
        ↓
[05 React 대시보드 출력]
  실시간 시각화 · 알림 표시
```

**외부 연동 시스템**
- OpenWeather API · 농사로 공공데이터 API
- Gemini AI API · Ajou LLM API
- Python FastAPI AI 서버 (자체 개발)
- Supabase PostgreSQL

<br>

## ✨ 주요 기능

### 1. 🌱 사용자 맞춤형 식물 추천
- 햇빛·벌레 민감도·베란다 방향 등 환경 설문 입력
- 입력 조건 기반으로 적합한 식물 자동 매칭
- Gemini API로 추천 이유 자연어 생성
- 추천 결과에서 온실 등록 바로 연결

**지원 식물 5종**

| 식물 | 환경 | 난이도 |
|------|------|--------|
| 산세베리아 | 실내 | 쉬움 |
| 몬스테라 | 실내 | 보통 |
| 방울토마토 | 실외 | 보통 |
| 상추 | 실외 | 쉬움 |
| 파 | 실외 | 쉬움 |

### 2. 💧 자동 관수 및 환경 제어 룰베이스
- 온도·습도·토양수분·조도 센서 데이터 실시간 수집
- IF-THEN 룰엔진 → 관수·환기·LED 자동 제어
- OpenWeather API → 외부 기상 데이터 반영
- SunCalc 기반 일출·일몰 계산 → LED 필요 여부 자동 판단
- 가상 센서 모드 지원 → 장비 없이 시뮬레이션 체험 가능

**자동 제어 시나리오 6가지**

| 룰 | 조건 | 동작 |
|----|------|------|
| 자동 관수 | 토양수분 < 임계값 | 펌프 ON (히스테리시스) |
| 환기 알림 | 습도 > 임계값 | 창문 OPEN |
| LED 제어 | 태양 고도 < 기준 (SunCalc) | LED ON |
| 병해충 경보 | 온도·습도 조건 동시 초과 | 알림 저장 |
| 비 예보 스킵 | 강수 확률 ≥ 50% (실외) | 관수 건너뜀 |
| 저온 경보 | 온도 < 최솟값 | 창문 CLOSE + 알림 |

### 3. 📋 Gemini AI 일일 리포트
- 매일 오후 8시 자동 생성
- 하루 센서 데이터 집계 → Gemini AI 분석 → 건강 요약 + 행동 추천
- 온도·습도 조건 기반 병해충 위험도 계산 포함
- 채팅 스타일 UI로 친근하게 리포트 수신
- 누적 리포트 이력 조회 가능

### 4. 💬 Gemini 실시간 채팅
- 채팅으로 식물 질문 → 학습된 AI 즉시 답변
- 현재 센서 데이터 기반 맞춤 응답 제공
- 병해충·질병 정보 실시간 조회 가능
- 초보 사용자도 부담 없이 정보 확인 가능

### 5. 🔬 병해충 진단 AI 모델
- 식물 잎 사진 업로드 → 질병 여부 및 신뢰도 즉시 반환
- AI Hub 데이터셋 기반으로 학습된 ResNet18 모델 (팀 직접 학습·개발)
- 자체 FastAPI 서버 독립 배포 → 백엔드 REST API 연동
- 진단 결과 및 조치 방법 안내
- 분석 이력 저장 및 조회 가능

<br>

## 📊 프로젝트 결과

### 정량적 성과
- REST API **20+** 개 구현
- 식물 맞춤 룰엔진 **5종**
- 자동 제어 시나리오 **6가지**
- 소셜 로그인 **3종** 지원 (이메일·Google·Kakao)

### 구현 완료 기능
- Supabase Auth 멀티 소셜 로그인
- MQTT 센서 → DB 저장 파이프라인
- 룰베이스 자동 제어 엔진
- OpenWeather 기상 연동
- 농촌진흥청 공공데이터 식물 DB 연동
- Gemini AI 일일 리포트 자동 생성
- ResNet18 질병 분류 모델 자체 학습·배포
- React 실시간 센서 대시보드
- 전체 서비스 배포 완료

<br>

## 🚀 기대 효과

**사용자 측면**
- 전문 지식 없이도 체계적인 식물 관리 가능
- AI 기반 질병 조기 감지로 식물 폐사 방지
- 홈가드닝 성공 경험 증가 → 지속적인 참여 유도

**기술적 측면**
- MQTT 기반 IoT 시스템 설계 경험 확보
- AI 모델 학습·배포 경험 확보 (ResNet18 → FastAPI)
- 디지털 트윈 플랫폼으로 확장 가능한 구조

<br>

## 🔭 향후 계획

- 실제 아두이노 센서 연동
- Supabase RLS 보안 정책 적용
- AI 모델 정확도 개선 (데이터셋 확대)
- YOLO 기반 객체 탐지 도입 → 병해충 발생 부위 시각화
- 병해충 다중 분류 지원
- 미세먼지·풍속 연동 환기 판단 고도화

<br>

## 👥 팀원

| 이름 | 학과 | 역할 |
|------|------|------|
| 김효정 | 디지털미디어학과 | Frontend |
| 김정하 | 소프트웨어학과 | Backend · AI |

**지도교수**: 고욱 교수님 (디지털미디어학과)
**멘토**: 제민욱 멘토님

<br>

## 📄 라이선스

This project is licensed under the MIT License.
