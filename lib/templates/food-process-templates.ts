/**
 * 식품 공정 BPMN 템플릿 라이브러리
 * 실제 식품 제조 공정에서 사용할 수 있는 BPMN 프로세스 템플릿
 */

export interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: "제조" | "품질관리" | "HACCP" | "위생관리" | "포장";
  bpmnXml: string;
  variables?: Record<string, any>;
}

export const FOOD_PROCESS_TEMPLATES: ProcessTemplate[] = [
  // 1. 빵 제조 공정
  {
    id: "bread-manufacturing",
    name: "빵 제조 공정",
    description: "빵 제조의 전체 공정 (반죽 → 발효 → 성형 → 굽기 → 포장)",
    category: "제조",
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="BreadManufacturing"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="BreadProcess" name="빵 제조 공정" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="제조 시작"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_MaterialPrep"/>

    <bpmn:userTask id="Task_MaterialPrep" name="원재료 준비 및 계량">
      <bpmn:documentation>밀가루, 물, 이스트, 소금, 설탕 등 계량</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_MaterialPrep" targetRef="Task_Mixing"/>

    <bpmn:userTask id="Task_Mixing" name="반죽 (믹싱)">
      <bpmn:documentation>재료 혼합 및 반죽 (15-20분)</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_Mixing" targetRef="CCP_Fermentation"/>

    <bpmn:userTask id="CCP_Fermentation" name="1차 발효 (CCP-1)">
      <bpmn:documentation>온도: 27-30°C, 습도: 75-85%, 시간: 60-90분</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="CCP_Fermentation" targetRef="Task_Shaping"/>

    <bpmn:userTask id="Task_Shaping" name="성형"/>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Shaping" targetRef="Task_SecondFerment"/>

    <bpmn:userTask id="Task_SecondFerment" name="2차 발효">
      <bpmn:documentation>온도: 35-38°C, 습도: 80-85%, 시간: 30-40분</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_SecondFerment" targetRef="CCP_Baking"/>

    <bpmn:userTask id="CCP_Baking" name="굽기 (CCP-2)">
      <bpmn:documentation>온도: 180-200°C, 시간: 20-30분, 중심온도: 95°C 이상</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="CCP_Baking" targetRef="CCP_Cooling"/>

    <bpmn:userTask id="CCP_Cooling" name="냉각 (CCP-3)">
      <bpmn:documentation>실온에서 30분 이상 냉각, 중심온도 35°C 이하</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_8" sourceRef="CCP_Cooling" targetRef="Task_Packaging"/>

    <bpmn:userTask id="Task_Packaging" name="포장">
      <bpmn:documentation>개별 포장 및 라벨링 (LOT 번호, 유통기한 표시)</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_Packaging" targetRef="Task_FinalInspection"/>

    <bpmn:userTask id="Task_FinalInspection" name="최종 검사">
      <bpmn:documentation>외관, 무게, 포장 상태 검사</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_FinalInspection" targetRef="EndEvent_1"/>

    <bpmn:endEvent id="EndEvent_1" name="제조 완료"/>
  </bpmn:process>
</bpmn:definitions>`,
    variables: {
      productName: "식빵",
      batchSize: 100,
      targetTemperature: 190,
    },
  },

  // 2. 우유 살균 공정
  {
    id: "milk-pasteurization",
    name: "우유 살균 공정",
    description: "원유 살균 및 포장 공정 (HTST/UHT)",
    category: "HACCP",
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   id="MilkPasteurization"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="MilkProcess" name="우유 살균 공정" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="공정 시작"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="CCP_Reception"/>

    <bpmn:userTask id="CCP_Reception" name="원유 입고 검사 (CCP-1)">
      <bpmn:documentation>온도: 10°C 이하, 세균수 측정, 항생물질 검사</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="CCP_Reception" targetRef="Gateway_QC"/>

    <bpmn:exclusiveGateway id="Gateway_QC" name="품질 적합?"/>
    <bpmn:sequenceFlow id="Flow_Pass" sourceRef="Gateway_QC" targetRef="Task_Storage">
      <bpmn:conditionExpression>passed == true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Fail" sourceRef="Gateway_QC" targetRef="Task_Reject">
      <bpmn:conditionExpression>passed == false</bpmn:conditionExpression>
    </bpmn:sequenceFlow>

    <bpmn:userTask id="Task_Reject" name="부적합 처리"/>
    <bpmn:sequenceFlow id="Flow_Reject" sourceRef="Task_Reject" targetRef="EndEvent_Reject"/>
    <bpmn:endEvent id="EndEvent_Reject" name="공정 종료 (부적합)"/>

    <bpmn:userTask id="Task_Storage" name="냉장 보관">
      <bpmn:documentation>온도: 0-4°C 유지</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_Storage" targetRef="Task_Filtration"/>

    <bpmn:userTask id="Task_Filtration" name="여과"/>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_Filtration" targetRef="Task_Homogenization"/>

    <bpmn:userTask id="Task_Homogenization" name="균질화">
      <bpmn:documentation>압력: 150-200 bar</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Homogenization" targetRef="CCP_Pasteurization"/>

    <bpmn:userTask id="CCP_Pasteurization" name="살균 (CCP-2)">
      <bpmn:documentation>HTST: 72-75°C, 15초 또는 UHT: 135-150°C, 2-4초</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="CCP_Pasteurization" targetRef="CCP_Cooling"/>

    <bpmn:userTask id="CCP_Cooling" name="냉각 (CCP-3)">
      <bpmn:documentation>급속 냉각: 4°C 이하</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="CCP_Cooling" targetRef="Task_AsepticPackaging"/>

    <bpmn:userTask id="Task_AsepticPackaging" name="무균 충전 및 포장">
      <bpmn:documentation>무균실 환경, 자동 충전</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_AsepticPackaging" targetRef="Task_QualityTest"/>

    <bpmn:userTask id="Task_QualityTest" name="제품 검사">
      <bpmn:documentation>세균수, 맛, 냄새, 색 검사</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_QualityTest" targetRef="EndEvent_1"/>

    <bpmn:endEvent id="EndEvent_1" name="공정 완료"/>
  </bpmn:process>
</bpmn:definitions>`,
    variables: {
      productType: "저온살균우유",
      pasteurizationType: "HTST",
    },
  },

  // 3. 김치 제조 공정
  {
    id: "kimchi-manufacturing",
    name: "김치 제조 공정",
    description: "배추김치 제조 전 공정",
    category: "제조",
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   id="KimchiManufacturing"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="KimchiProcess" name="김치 제조 공정" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="제조 시작"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_MaterialInspection"/>

    <bpmn:userTask id="Task_MaterialInspection" name="원재료 입고 검사">
      <bpmn:documentation>배추, 무, 고춧가루 등 신선도 및 이물질 검사</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_MaterialInspection" targetRef="CCP_Washing"/>

    <bpmn:userTask id="CCP_Washing" name="세척 (CCP-1)">
      <bpmn:documentation">3회 이상 세척, 잔류 농약 제거, 염소수 100ppm</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="CCP_Washing" targetRef="Task_Salting"/>

    <bpmn:userTask id="Task_Salting" name="절임">
      <bpmn:documentation>소금물 농도 10-12%, 시간 6-8시간</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_Salting" targetRef="Task_Rinsing"/>

    <bpmn:userTask id="Task_Rinsing" name="헹굼 및 탈수"/>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Rinsing" targetRef="Task_SeasoningPrep"/>

    <bpmn:userTask id="Task_SeasoningPrep" name="양념 준비">
      <bpmn:documentation">고춧가루, 마늘, 생강, 젓갈 등</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_SeasoningPrep" targetRef="CCP_Mixing"/>

    <bpmn:userTask id="CCP_Mixing" name="버무리기 (CCP-2)">
      <bpmn:documentation>온도 10°C 이하 냉장 환경, 위생 장갑 착용</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="CCP_Mixing" targetRef="Task_Packaging"/>

    <bpmn:userTask id="Task_Packaging" name="포장">
      <bpmn:documentation>진공 포장 또는 밀폐 용기, LOT 번호 표시</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_Packaging" targetRef="CCP_Storage"/>

    <bpmn:userTask id="CCP_Storage" name="숙성 및 보관 (CCP-3)">
      <bpmn:documentation">온도: 0-5°C, 습도: 85-90%</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_9" sourceRef="CCP_Storage" targetRef="Task_FinalInspection"/>

    <bpmn:userTask id="Task_FinalInspection" name="최종 검사">
      <bpmn:documentation>pH, 염도, 관능검사</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_FinalInspection" targetRef="EndEvent_1"/>

    <bpmn:endEvent id="EndEvent_1" name="제조 완료"/>
  </bpmn:process>
</bpmn:definitions>`,
    variables: {
      productName: "배추김치",
      saltingTime: 480, // 분
    },
  },

  // 4. 위생 점검 프로세스
  {
    id: "hygiene-inspection",
    name: "일일 위생 점검",
    description: "HACCP 일일 위생 관리 점검 프로세스",
    category: "위생관리",
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   id="HygieneInspection"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="HygieneProcess" name="일일 위생 점검" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="점검 시작"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_PersonalHygiene"/>

    <bpmn:userTask id="Task_PersonalHygiene" name="개인 위생 점검">
      <bpmn:documentation>작업복, 모자, 마스크, 손 세척 확인</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_PersonalHygiene" targetRef="Task_FacilityClean"/>

    <bpmn:userTask id="Task_FacilityClean" name="시설 청소 점검">
      <bpmn:documentation>작업장 바닥, 벽, 천장, 배수구</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_FacilityClean" targetRef="Task_EquipmentSanitize"/>

    <bpmn:userTask id="Task_EquipmentSanitize" name="기구 세척 및 소독">
      <bpmn:documentation">세척제 농도 확인, 소독제 농도 확인</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_EquipmentSanitize" targetRef="Task_PestControl"/>

    <bpmn:userTask id="Task_PestControl" name="방충/방서 점검">
      <bpmn:documentation>포충등, 쥐덫, 출입구 확인</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_PestControl" targetRef="Task_TemperatureCheck"/>

    <bpmn:userTask id="Task_TemperatureCheck" name="온도 관리 점검">
      <bpmn:documentation>냉장고, 냉동고 온도 기록</bpmn:documentation>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_TemperatureCheck" targetRef="Task_RecordKeeping"/>

    <bpmn:userTask id="Task_RecordKeeping" name="기록 작성 및 서명"/>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_RecordKeeping" targetRef="EndEvent_1"/>

    <bpmn:endEvent id="EndEvent_1" name="점검 완료"/>
  </bpmn:process>
</bpmn:definitions>`,
  },
];

/**
 * 템플릿 조회
 */
export function getTemplateById(id: string): ProcessTemplate | undefined {
  return FOOD_PROCESS_TEMPLATES.find((t) => t.id === id);
}

/**
 * 카테고리별 템플릿 조회
 */
export function getTemplatesByCategory(
  category: "제조" | "품질관리" | "HACCP" | "위생관리" | "포장"
): ProcessTemplate[] {
  return FOOD_PROCESS_TEMPLATES.filter((t) => t.category === category);
}

/**
 * 모든 템플릿 조회
 */
export function getAllTemplates(): ProcessTemplate[] {
  return FOOD_PROCESS_TEMPLATES;
}
