
import { Workflow } from '../types/workflow';

export const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: '이메일 마케팅 자동화',
    description: '새로운 고객에게 환영 이메일을 자동으로 보내는 워크플로우',
    status: 'active',
    lastRun: '2025-04-02T14:30:00Z',
    createdAt: '2025-03-15T10:20:00Z',
    updatedAt: '2025-04-02T14:30:00Z',
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        name: '신규 고객 등록',
        description: '새로운 고객이 등록될 때 트리거',
        position: { x: 100, y: 100 },
        data: {},
        connections: ['node2']
      },
      {
        id: 'node2',
        type: 'action',
        name: '환영 이메일 전송',
        description: '새로운 고객에게 환영 이메일 전송',
        position: { x: 400, y: 100 },
        data: {
          template: 'welcome_email'
        },
        connections: ['node3']
      },
      {
        id: 'node3',
        type: 'action',
        name: 'CRM 업데이트',
        description: '이메일 전송 후 CRM 시스템 업데이트',
        position: { x: 700, y: 100 },
        data: {},
        connections: []
      }
    ]
  },
  {
    id: '2',
    name: '인보이스 처리 자동화',
    description: '월간 인보이스 생성 및 발송을 자동화하는 워크플로우',
    status: 'active',
    lastRun: '2025-04-01T00:00:00Z',
    createdAt: '2025-02-10T09:15:00Z',
    updatedAt: '2025-04-01T00:00:00Z',
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        name: '월간 스케줄',
        description: '매달 1일에 트리거',
        position: { x: 100, y: 100 },
        data: {
          schedule: '0 0 1 * *'
        },
        connections: ['node2']
      },
      {
        id: 'node2',
        type: 'action',
        name: '인보이스 생성',
        description: '모든 활성 고객에 대한 인보이스 생성',
        position: { x: 400, y: 100 },
        data: {},
        connections: ['node3']
      },
      {
        id: 'node3',
        type: 'action',
        name: '이메일 전송',
        description: '생성된 인보이스를 이메일로 전송',
        position: { x: 700, y: 100 },
        data: {},
        connections: []
      }
    ]
  },
  {
    id: '3',
    name: '소셜 미디어 모니터링',
    description: '주요 키워드에 대한 소셜 미디어 언급을 모니터링',
    status: 'inactive',
    lastRun: null,
    createdAt: '2025-03-20T16:45:00Z',
    updatedAt: '2025-03-20T16:45:00Z',
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        name: '소셜 미디어 멘션',
        description: '키워드가 언급될 때 트리거',
        position: { x: 100, y: 100 },
        data: {
          keywords: ['브랜드명', '제품명']
        },
        connections: ['node2']
      },
      {
        id: 'node2',
        type: 'action',
        name: '감정 분석',
        description: '멘션에 대한 감정 분석 수행',
        position: { x: 400, y: 100 },
        data: {},
        connections: ['node3', 'node4']
      },
      {
        id: 'node3',
        type: 'action',
        name: '긍정적 멘션 저장',
        description: '긍정적인 멘션을 데이터베이스에 저장',
        position: { x: 700, y: 50 },
        data: {},
        connections: []
      },
      {
        id: 'node4',
        type: 'action',
        name: '부정적 멘션 알림',
        description: '부정적인 멘션에 대해 팀에 알림',
        position: { x: 700, y: 200 },
        data: {},
        connections: []
      }
    ]
  },
  {
    id: '4',
    name: '리드 점수 계산',
    description: '잠재 고객의 활동을 기반으로 리드 점수를 계산',
    status: 'error',
    lastRun: '2025-04-02T10:15:00Z',
    createdAt: '2025-01-05T11:30:00Z',
    updatedAt: '2025-04-02T10:15:00Z',
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        name: '고객 활동',
        description: '고객 활동이 기록될 때 트리거',
        position: { x: 100, y: 100 },
        data: {},
        connections: ['node2']
      },
      {
        id: 'node2',
        type: 'action',
        name: '점수 계산',
        description: '활동 유형에 따라 점수 계산',
        position: { x: 400, y: 100 },
        data: {},
        connections: ['node3']
      },
      {
        id: 'node3',
        type: 'condition',
        name: '점수 확인',
        description: '점수가 임계값을 초과하는지 확인',
        position: { x: 700, y: 100 },
        data: {
          threshold: 100
        },
        connections: ['node4', 'node5']
      },
      {
        id: 'node4',
        type: 'action',
        name: '세일즈팀 알림',
        description: '고점수 리드에 대해 세일즈팀에 알림',
        position: { x: 1000, y: 50 },
        data: {},
        connections: []
      },
      {
        id: 'node5',
        type: 'action',
        name: '마케팅 이메일 전송',
        description: '저점수 리드에게 마케팅 이메일 전송',
        position: { x: 1000, y: 200 },
        data: {},
        connections: []
      }
    ]
  }
];
