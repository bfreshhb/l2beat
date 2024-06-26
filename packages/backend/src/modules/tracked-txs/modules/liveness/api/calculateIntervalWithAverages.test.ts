import { UnixTime } from '@l2beat/shared-pure'
import { expect } from 'earl'
import { cloneDeep } from 'lodash'

import {
  LivenessRecordWithInterval,
  calculateIntervalWithAverages,
  calculateIntervals,
  calculateMinMaxAverages,
} from './calculateIntervalWithAverages'

const NOW = UnixTime.now()

const RECORDS: LivenessRecordWithInterval[] = [
  {
    timestamp: NOW,
    subtype: 'batchSubmissions',
    previousRecordInterval: 3600,
  },
  {
    timestamp: NOW.add(-1, 'hours'),
    subtype: 'batchSubmissions',
    previousRecordInterval: 7200,
  },
  {
    timestamp: NOW.add(-3, 'hours'),
    subtype: 'batchSubmissions',
    previousRecordInterval: 86_400 * 31 - 10_800,
  },
  {
    timestamp: NOW.add(-31, 'days'),
    subtype: 'stateUpdates',
  },
  {
    timestamp: NOW.add(-31, 'days').add(-1, 'hours'),
    subtype: 'stateUpdates',
  },
  {
    timestamp: NOW.add(-91, 'days'),
    subtype: 'batchSubmissions',
  },
  {
    timestamp: NOW.add(-92, 'days'),
    subtype: 'batchSubmissions',
  },
  {
    timestamp: NOW.add(-93, 'days'),
    subtype: 'batchSubmissions',
  },
  {
    timestamp: NOW.add(-93, 'days'),
    subtype: 'proofSubmissions',
  },
  {
    timestamp: NOW.add(-94, 'days'),
    subtype: 'proofSubmissions',
  },
]

describe(calculateIntervals.name, () => {
  it('returns records with intervals', () => {
    const expected: LivenessRecordWithInterval[] = [
      {
        timestamp: NOW,
        subtype: 'batchSubmissions',
        previousRecordInterval: 3600,
      },
      {
        timestamp: NOW.add(-1, 'hours'),
        subtype: 'batchSubmissions',
        previousRecordInterval: 2 * 3600,
      },
      {
        timestamp: NOW.add(-3, 'hours'),
        subtype: 'batchSubmissions',
      },
    ]
    const input = cloneDeep(RECORDS).slice(0, 3)
    // biome-ignore lint/performance/noDelete: this is a test
    delete input[2].previousRecordInterval
    calculateIntervals(input)

    expect(input).toEqual(expected)
  })
})

describe(calculateMinMaxAverages.name, () => {
  it('returns the averages for stateUpdates with undefined', () => {
    const input = cloneDeep(RECORDS).filter((r) => r.subtype === 'stateUpdates')
    calculateIntervals(input)
    const result = calculateMinMaxAverages(input)
    const expected = {
      last30Days: undefined,
      last90Days: {
        averageInSeconds: 3600,
        minimumInSeconds: 3600,
        maximumInSeconds: 3600,
      },
      allTime: {
        averageInSeconds: 3600,
        minimumInSeconds: 3600,
        maximumInSeconds: 3600,
      },
    }
    expect(result).toEqual(expected)
  })
  it('returns the averages for batchSubmissions', () => {
    const input = cloneDeep(RECORDS)
    calculateIntervals(input)
    const result = calculateMinMaxAverages(
      input.filter((r) => r.subtype === 'batchSubmissions'),
    )
    const expected = {
      last30Days: {
        averageInSeconds: 892800,
        minimumInSeconds: 3600,
        maximumInSeconds: 2667600,
      },
      last90Days: {
        averageInSeconds: 892800,
        minimumInSeconds: 3600,
        maximumInSeconds: 2667600,
      },
      allTime: {
        averageInSeconds: 570240,
        minimumInSeconds: 3600,
        maximumInSeconds: 2667600,
      },
    }
    expect(result).toEqual(expected)
  })
})

describe(calculateIntervalWithAverages.name, () => {
  it('returns the intervals with averages', () => {
    const result = calculateIntervalWithAverages({
      project1: {
        batchSubmissions: {
          records: RECORDS.filter((r) => r.subtype === 'batchSubmissions'),
        },
        stateUpdates: {
          records: RECORDS.filter((r) => r.subtype === 'stateUpdates'),
        },
        proofSubmissions: {
          records: RECORDS.filter((r) => r.subtype === 'proofSubmissions'),
        },
      },
    })

    const batchSubmissionRecords = cloneDeep(RECORDS).filter(
      (r) => r.subtype === 'batchSubmissions',
    )
    calculateIntervals(batchSubmissionRecords)
    const stateUpdateRecords = cloneDeep(RECORDS).filter(
      (r) => r.subtype === 'stateUpdates',
    )
    calculateIntervals(stateUpdateRecords)
    const proofSubmissionsRecords = cloneDeep(RECORDS).filter(
      (r) => r.subtype === 'proofSubmissions',
    )
    calculateIntervals(proofSubmissionsRecords)

    const expected = {
      project1: {
        batchSubmissions: {
          records: batchSubmissionRecords,
          last30Days: {
            averageInSeconds: 2620800,
            minimumInSeconds: 3600,
            maximumInSeconds: 7851600,
          },
          last90Days: {
            averageInSeconds: 2620800,
            minimumInSeconds: 3600,
            maximumInSeconds: 7851600,
          },
          allTime: {
            averageInSeconds: 1607040,
            minimumInSeconds: 3600,
            maximumInSeconds: 7851600,
          },
        },

        stateUpdates: {
          records: stateUpdateRecords,
          last30Days: undefined,
          last90Days: {
            averageInSeconds: 3600,
            minimumInSeconds: 3600,
            maximumInSeconds: 3600,
          },
          allTime: {
            averageInSeconds: 3600,
            minimumInSeconds: 3600,
            maximumInSeconds: 3600,
          },
        },
        proofSubmissions: {
          records: proofSubmissionsRecords,
          last30Days: undefined,
          last90Days: undefined,
          allTime: {
            averageInSeconds: 86400,
            minimumInSeconds: 86400,
            maximumInSeconds: 86400,
          },
        },
      },
    }
    expect(result).toEqual(expected)
  })
})
