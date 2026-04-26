import { useEffect, useMemo, useState } from 'react'
import './App.css'

// Helper metadata describing each dimension and its metric labels.
const DIMENSION_CONFIG = {
  performance: {
    label: 'Performance',
    metrics: ['onTimeDelivery', 'fillRate', 'defectRate', 'invoiceAccuracy'],
    metricLabels: {
      onTimeDelivery: 'On-time delivery %',
      fillRate: 'Fill rate %',
      defectRate: 'Defect rate % (inverted)',
      invoiceAccuracy: 'Invoice accuracy %',
    },
  },
  risk: {
    label: 'Risk',
    metrics: [
      'financialHealth',
      'geographicConcentration',
      'singleSourceDependency',
      'backupSupplierExists',
    ],
    metricLabels: {
      financialHealth: 'Financial health score',
      geographicConcentration: 'Geographic concentration (inverted)',
      singleSourceDependency: 'Single-source dependency',
      backupSupplierExists: 'Backup supplier exists',
    },
  },
  compliance: {
    label: 'Compliance',
    metrics: ['lastAuditScore', 'certificationsHeld', 'openCorrectiveActions', 'regulatoryIncidents'],
    metricLabels: {
      lastAuditScore: 'Last audit score',
      certificationsHeld: 'Certifications held',
      openCorrectiveActions: 'Open corrective actions (inverted)',
      regulatoryIncidents: 'Regulatory incidents (inverted)',
    },
  },
  sustainability: {
    label: 'Sustainability',
    metrics: ['emissionsDataAvailable', 'renewableEnergyUsage', 'laborCertificationsHeld', 'wasteTargetsCommitted'],
    metricLabels: {
      emissionsDataAvailable: 'Emissions data available',
      renewableEnergyUsage: 'Renewable energy usage %',
      laborCertificationsHeld: 'Labor certifications held',
      wasteTargetsCommitted: 'Waste reduction targets committed',
    },
  },
}

// Mock CPG supplier data with raw values only; scoring is always calculated.
const SUPPLIERS = [
  {
    id: 'basf',
    name: 'BASV SE',
    country: 'Germany',
    category: 'Specialty Chemicals',
    tier: 'Tier 1',
    annualSpend: 12500000,
    lastAuditDate: '2025-11-12',
    activeFlags: ['ISO renewal pending'],
    complianceDocuments: [
      {
        id: 'basf-audit-report',
        title: 'Latest Audit Report',
        type: 'Audit Report',
        status: 'available',
        fileUrl: '/sample-compliance-report.pdf',
        lastUpdated: '2026-02-11',
      },
      {
        id: 'basf-coa-pack',
        title: 'Certificate of Analysis Pack',
        type: 'COA',
        status: 'missing',
      },
    ],
    performance: { onTimeDelivery: 90, fillRate: 92, defectRate: 6, invoiceAccuracy: 96 },
    risk: { financialHealth: 88, geographicConcentration: 55, backupSupplierExists: true },
    compliance: { lastAuditScore: 91, certificationsHeld: 5, openCorrectiveActions: 2, regulatoryIncidents: 5 },
    sustainability: { emissionsDataAvailable: true, renewableEnergyUsage: 62, laborCertificationsHeld: true, wasteTargetsCommitted: true },
  },
  {
    id: 'flex',
    name: 'Flextor Ltd',
    country: 'Singapore',
    category: 'Contract Manufacturing',
    tier: 'Tier 1',
    annualSpend: 21400000,
    lastAuditDate: '2025-09-01',
    activeFlags: ['Capacity utilization high'],
    complianceDocuments: [
      {
        id: 'flex-audit-report',
        title: 'Latest Audit Report',
        type: 'Audit Report',
        status: 'available',
        fileUrl: '/sample-compliance-report.pdf',
        lastUpdated: '2026-01-19',
      },
      {
        id: 'flex-corrective-log',
        title: 'Corrective Action Closure Log',
        type: 'CAPA Log',
        status: 'available',
        fileUrl: '/sample-compliance-report.pdf',
        lastUpdated: '2026-03-08',
      },
    ],
    performance: { onTimeDelivery: 78, fillRate: 83, defectRate: 14, invoiceAccuracy: 87 },
    risk: { financialHealth: 74, geographicConcentration: 68, backupSupplierExists: true },
    compliance: { lastAuditScore: 80, certificationsHeld: 3, openCorrectiveActions: 6, regulatoryIncidents: 16 },
    sustainability: { emissionsDataAvailable: true, renewableEnergyUsage: 48, laborCertificationsHeld: false, wasteTargetsCommitted: true },
  },
  {
    id: 'givaudan',
    name: 'Givodan SA',
    country: 'Switzerland',
    category: 'Flavor Solutions',
    tier: 'Tier 1',
    annualSpend: 9700000,
    lastAuditDate: '2025-10-18',
    activeFlags: ['Natural flavor lead-time variability'],
    complianceDocuments: [
      {
        id: 'givaudan-audit-report',
        title: 'Latest Audit Report',
        type: 'Audit Report',
        status: 'available',
        fileUrl: '/sample-compliance-report.pdf',
        lastUpdated: '2026-03-03',
      },
      {
        id: 'givaudan-regulatory-file',
        title: 'Regulatory Incident File',
        type: 'Regulatory Log',
        status: 'missing',
      },
    ],
    performance: { onTimeDelivery: 86, fillRate: 88, defectRate: 9, invoiceAccuracy: 93 },
    risk: { financialHealth: 84, geographicConcentration: 61, backupSupplierExists: true },
    compliance: { lastAuditScore: 89, certificationsHeld: 4, openCorrectiveActions: 4, regulatoryIncidents: 8 },
    sustainability: { emissionsDataAvailable: true, renewableEnergyUsage: 58, laborCertificationsHeld: true, wasteTargetsCommitted: true },
  },
  {
    id: 'smurfit',
    name: 'Smurfit Kappra',
    country: 'Ireland',
    category: 'Packaging',
    tier: 'Tier 2',
    annualSpend: 6900000,
    lastAuditDate: '2025-07-27',
    activeFlags: ['Freight lane disruption watch'],
    complianceDocuments: [
      {
        id: 'smurfit-audit-report',
        title: 'Latest Audit Report',
        type: 'Audit Report',
        status: 'missing',
      },
      {
        id: 'smurfit-packaging-compliance',
        title: 'Packaging Compliance Certificate',
        type: 'Certificate',
        status: 'missing',
      },
    ],
    performance: { onTimeDelivery: 81, fillRate: 85, defectRate: 11, invoiceAccuracy: 90 },
    risk: { financialHealth: 77, geographicConcentration: 64, backupSupplierExists: true },
    compliance: { lastAuditScore: 83, certificationsHeld: 4, openCorrectiveActions: 5, regulatoryIncidents: 12 },
    sustainability: { emissionsDataAvailable: true, renewableEnergyUsage: 70, laborCertificationsHeld: true, wasteTargetsCommitted: true },
  },
  {
    id: 'kerry',
    name: 'Kerrion Group',
    country: 'Ireland',
    category: 'Food Ingredients',
    tier: 'Tier 2',
    annualSpend: 8200000,
    lastAuditDate: '2025-05-09',
    activeFlags: ['Single-site dependency', 'CAPA closure overdue'],
    complianceDocuments: [
      {
        id: 'kerry-audit-report',
        title: 'Latest Audit Report',
        type: 'Audit Report',
        status: 'available',
        fileUrl: '/sample-compliance-report.pdf',
        lastUpdated: '2025-12-14',
      },
      {
        id: 'kerry-labor-compliance',
        title: 'Labor Practice Compliance File',
        type: 'Labor Compliance',
        status: 'missing',
      },
    ],
    performance: { onTimeDelivery: 68, fillRate: 72, defectRate: 22, invoiceAccuracy: 79 },
    risk: { financialHealth: 62, geographicConcentration: 82, backupSupplierExists: false },
    compliance: { lastAuditScore: 70, certificationsHeld: 2, openCorrectiveActions: 8, regulatoryIncidents: 24 },
    sustainability: { emissionsDataAvailable: false, renewableEnergyUsage: 29, laborCertificationsHeld: false, wasteTargetsCommitted: false },
  },
]

// Required compliance docs for onboarding; presence is optional but tracked.
const REQUIRED_COMPLIANCE_DOCUMENTS = [
  { id: 'latest-audit-report', title: 'Latest Audit Report', type: 'Audit Report' },
  { id: 'certificate-of-analysis', title: 'Certificate of Analysis Pack', type: 'COA' },
  { id: 'regulatory-incident-file', title: 'Regulatory Incident File', type: 'Regulatory Log' },
  { id: 'labor-compliance-file', title: 'Labor Practice Compliance File', type: 'Labor Compliance' },
]

const SUPPLIER_COUNTRY_OPTIONS = ['Germany', 'Singapore', 'Switzerland', 'Ireland', 'United States', 'Canada']
const SUPPLIER_CATEGORY_OPTIONS = [
  'Specialty Chemicals',
  'Contract Manufacturing',
  'Flavor Solutions',
  'Packaging',
  'Food Ingredients',
]

// Material list plus supplier-specific commercial details.
const MATERIALS = [
  {
    id: 'specialty-resin',
    name: 'Specialty Resin',
    category: 'Packaging Polymer',
    unitOfMeasure: 'kg',
    annualVolume: 2550000,
    suppliers: [
      {
        supplierId: 'basf',
        contractStartDate: '2024-01-01',
        contractEndDate: '2027-12-31',
        contractValue: 7600000,
        quotaAllocation: 70,
        minimumOrderQuantity: 18000,
        paymentTerms: 'Net 45',
      },
      {
        supplierId: 'kerry',
        contractStartDate: '2024-06-01',
        contractEndDate: '2026-11-30',
        contractValue: 2200000,
        quotaAllocation: 30,
        minimumOrderQuantity: 12000,
        paymentTerms: 'Net 30',
      },
    ],
  },
  {
    id: 'corrugated-packaging',
    name: 'Corrugated Packaging',
    category: 'Secondary Packaging',
    unitOfMeasure: 'units',
    annualVolume: 42000000,
    suppliers: [
      {
        supplierId: 'smurfit',
        contractStartDate: '2025-01-01',
        contractEndDate: '2028-12-31',
        contractValue: 6400000,
        quotaAllocation: 65,
        minimumOrderQuantity: 90000,
        paymentTerms: 'Net 60',
      },
      {
        supplierId: 'flex',
        contractStartDate: '2025-01-01',
        contractEndDate: '2027-06-30',
        contractValue: 2800000,
        quotaAllocation: 35,
        minimumOrderQuantity: 75000,
        paymentTerms: 'Net 45',
      },
    ],
  },
  {
    id: 'natural-flavors',
    name: 'Natural Flavors',
    category: 'Flavor System',
    unitOfMeasure: 'kg',
    annualVolume: 350000,
    suppliers: [
      {
        supplierId: 'givaudan',
        contractStartDate: '2024-07-01',
        contractEndDate: '2027-06-30',
        contractValue: 5100000,
        quotaAllocation: 100,
        minimumOrderQuantity: 2400,
        paymentTerms: 'Net 30',
      },
    ],
  },
  {
    id: 'contract-manufactured-goods',
    name: 'Contract Manufactured Goods',
    category: 'Finished Goods',
    unitOfMeasure: 'cases',
    annualVolume: 2100000,
    suppliers: [
      {
        supplierId: 'flex',
        contractStartDate: '2023-10-01',
        contractEndDate: '2026-09-30',
        contractValue: 13400000,
        quotaAllocation: 60,
        minimumOrderQuantity: 8000,
        paymentTerms: 'Net 60',
      },
      {
        supplierId: 'kerry',
        contractStartDate: '2024-02-01',
        contractEndDate: '2026-12-31',
        contractValue: 3900000,
        quotaAllocation: 40,
        minimumOrderQuantity: 6000,
        paymentTerms: 'Net 45',
      },
    ],
  },
  {
    id: 'food-ingredients',
    name: 'Food Ingredients',
    category: 'Core Ingredient',
    unitOfMeasure: 'kg',
    annualVolume: 4100000,
    suppliers: [
      {
        supplierId: 'kerry',
        contractStartDate: '2024-04-01',
        contractEndDate: '2027-03-31',
        contractValue: 5900000,
        quotaAllocation: 55,
        minimumOrderQuantity: 16000,
        paymentTerms: 'Net 45',
      },
      {
        supplierId: 'givaudan',
        contractStartDate: '2024-04-01',
        contractEndDate: '2026-12-31',
        contractValue: 2600000,
        quotaAllocation: 25,
        minimumOrderQuantity: 9000,
        paymentTerms: 'Net 30',
      },
      {
        supplierId: 'basf',
        contractStartDate: '2024-05-01',
        contractEndDate: '2027-04-30',
        contractValue: 2200000,
        quotaAllocation: 20,
        minimumOrderQuantity: 8000,
        paymentTerms: 'Net 60',
      },
    ],
  },
]

// Default weights for each dimension input.
const DEFAULT_DIMENSION_WEIGHTS = {
  performance: { onTimeDelivery: 30, fillRate: 25, defectRate: 20, invoiceAccuracy: 25 },
  risk: { financialHealth: 35, geographicConcentration: 30, singleSourceDependency: 20, backupSupplierExists: 15 },
  compliance: { lastAuditScore: 35, certificationsHeld: 20, openCorrectiveActions: 25, regulatoryIncidents: 20 },
  sustainability: { emissionsDataAvailable: 20, renewableEnergyUsage: 35, laborCertificationsHeld: 20, wasteTargetsCommitted: 25 },
}

// Default top-level weights used for overall health.
const DEFAULT_OVERALL_WEIGHTS = {
  performance: 30,
  risk: 30,
  compliance: 20,
  sustainability: 20,
}

// Calculates an equal split for any group with n sliders.
const getEqualWeights = (keys) => {
  const base = Math.floor(100 / keys.length)
  const remainder = 100 - base * keys.length
  return keys.reduce((acc, key, index) => {
    acc[key] = base + (index < remainder ? 1 : 0)
    return acc
  }, {})
}

// Ensures sliders in a group always total 100 by redistributing delta.
const rebalanceGroupWeights = (group, changedKey, nextValue) => {
  const clampedValue = Math.max(0, Math.min(100, Number(nextValue)))
  const otherKeys = Object.keys(group).filter((key) => key !== changedKey)
  if (otherKeys.length === 0) {
    return { [changedKey]: 100 }
  }

  const currentOthersTotal = otherKeys.reduce((sum, key) => sum + group[key], 0)
  const desiredOthersTotal = 100 - clampedValue
  const updated = { ...group, [changedKey]: clampedValue }

  // If all other sliders are 0, we distribute evenly to keep the sum constraint.
  if (currentOthersTotal === 0) {
    const equalized = getEqualWeights(otherKeys)
    otherKeys.forEach((key) => {
      updated[key] = Math.round((equalized[key] / 100) * desiredOthersTotal)
    })
  } else {
    otherKeys.forEach((key) => {
      updated[key] = Math.round((group[key] / currentOthersTotal) * desiredOthersTotal)
    })
  }

  // Correct rounding drift so total equals 100 exactly.
  const diff = 100 - Object.values(updated).reduce((sum, value) => sum + value, 0)
  if (diff !== 0) {
    updated[otherKeys[0]] += diff
  }

  return updated
}

// Converts each raw metric to a normalized 0-100 score.
const normalizeSupplierMetrics = (supplier, hasSingleSourceDependency) => ({
  performance: {
    onTimeDelivery: supplier.performance.onTimeDelivery,
    fillRate: supplier.performance.fillRate,
    defectRate: 100 - supplier.performance.defectRate,
    invoiceAccuracy: supplier.performance.invoiceAccuracy,
  },
  risk: {
    financialHealth: supplier.risk.financialHealth,
    geographicConcentration: 100 - supplier.risk.geographicConcentration,
    singleSourceDependency: hasSingleSourceDependency ? 0 : 100,
    backupSupplierExists: supplier.risk.backupSupplierExists ? 100 : 0,
  },
  compliance: {
    lastAuditScore: supplier.compliance.lastAuditScore,
    certificationsHeld: Math.min((supplier.compliance.certificationsHeld / 5) * 100, 100),
    openCorrectiveActions: Math.max(0, 100 - supplier.compliance.openCorrectiveActions * 2),
    regulatoryIncidents: Math.max(0, 100 - supplier.compliance.regulatoryIncidents * 5),
  },
  sustainability: {
    emissionsDataAvailable: supplier.sustainability.emissionsDataAvailable ? 100 : 0,
    renewableEnergyUsage: supplier.sustainability.renewableEnergyUsage,
    laborCertificationsHeld: supplier.sustainability.laborCertificationsHeld ? 100 : 0,
    wasteTargetsCommitted: supplier.sustainability.wasteTargetsCommitted ? 100 : 0,
  },
})

// Weighted average helper used across all score calculations.
const weightedAverage = (values, weights) => {
  const total = Object.keys(weights).reduce((sum, key) => sum + weights[key], 0)
  if (total === 0) return 0
  const weightedSum = Object.keys(weights).reduce((sum, key) => sum + values[key] * weights[key], 0)
  return weightedSum / total
}

const getStatusLabel = (score) => {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Monitor'
  return 'At Risk'
}

const formatPercent = (value) => `${value.toFixed(1)}`
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const formatTimestamp = (isoDate) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))

// Hardcoded detection dates per exception key so days-open values stay varied.
const EXCEPTION_DETECTED_DATES = {
  supplierAtRisk: '2026-03-20',
  supplyContinuityRisk: '2026-02-14',
  complianceGap: '2026-04-05',
  contractExpiringSoon: '2026-04-01',
  auditActionRequired: '2026-03-28',
  sustainabilityReviewNeeded: '2026-04-12',
}

const getExceptionSeverityClass = (severity) => severity.toLowerCase()
const getDaysOpen = (detectedDate, today) => {
  const openedAt = new Date(detectedDate)
  const diffMs = today.getTime() - openedAt.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}
const getLowestDimension = (dimensionScores) =>
  Object.entries(dimensionScores).reduce((lowest, current) => (current[1] < lowest[1] ? current : lowest))
const buildExceptionCards = ({ check, currentValue, trigger, context }) => [
  { label: 'Check', value: check },
  { label: 'Current Value', value: currentValue },
  { label: 'Trigger Rule', value: `Exception triggers when ${trigger}.` },
  { label: 'Context', value: context },
]

function App() {
  const [view, setView] = useState('supplier')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [suppliersData, setSuppliersData] = useState(SUPPLIERS)
  const [materialsData, setMaterialsData] = useState(MATERIALS)
  const [selectedSupplierId, setSelectedSupplierId] = useState(SUPPLIERS[0].id)
  const [selectedMaterialId, setSelectedMaterialId] = useState(MATERIALS[0].id)
  const [selectedDimensionKey, setSelectedDimensionKey] = useState(null)
  const [selectedExceptionId, setSelectedExceptionId] = useState(null)
  const [selectedExceptionFilter, setSelectedExceptionFilter] = useState('All')
  const [selectedSupplierExceptionFilter, setSelectedSupplierExceptionFilter] = useState('all')
  const [selectedMaterialExceptionFilter, setSelectedMaterialExceptionFilter] = useState('all')
  const [notificationTarget, setNotificationTarget] = useState(null)
  const [notifiedByExceptionId, setNotifiedByExceptionId] = useState({})
  const [isAddNewSupplierModalOpen, setIsAddNewSupplierModalOpen] = useState(false)
  const [newSupplierError, setNewSupplierError] = useState('')
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    country: '',
    category: '',
    tier: 'Tier 2',
    annualSpend: '',
    lastAuditDate: '',
    documents: REQUIRED_COMPLIANCE_DOCUMENTS.reduce((acc, doc) => {
      acc[doc.id] = false
      return acc
    }, {}),
  })
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false)
  const [addSupplierForm, setAddSupplierForm] = useState({
    supplierId: '',
    contractStartDate: '',
    contractEndDate: '',
    contractValue: '',
    quotaAllocation: '',
    minimumOrderQuantity: '',
    paymentTerms: '',
  })
  const [addSupplierError, setAddSupplierError] = useState('')
  const [dimensionWeights, setDimensionWeights] = useState(DEFAULT_DIMENSION_WEIGHTS)
  const [overallWeights, setOverallWeights] = useState(DEFAULT_OVERALL_WEIGHTS)
  const [materialSupplierWeights, setMaterialSupplierWeights] = useState(() =>
    materialsData.reduce((acc, material) => {
      const supplierIds = material.suppliers.map((entry) => entry.supplierId)
      acc[material.id] = getEqualWeights(supplierIds)
      return acc
    }, {}),
  )

  const derived = useMemo(() => {
    // Auto-derive single-source materials and supplier dependency flags.
    const singleSourceMaterialIds = new Set(
      materialsData.filter((material) => material.suppliers.length === 1).map((material) => material.id),
    )
    const singleSourceSupplierIds = new Set(
      materialsData.filter((material) => material.suppliers.length === 1).map((material) => material.suppliers[0].supplierId),
    )

    const supplierScores = suppliersData.map((supplier) => {
      const normalizedMetrics = normalizeSupplierMetrics(supplier, singleSourceSupplierIds.has(supplier.id))
      const dimensionScores = {
        performance: weightedAverage(normalizedMetrics.performance, dimensionWeights.performance),
        risk: weightedAverage(normalizedMetrics.risk, dimensionWeights.risk),
        compliance: weightedAverage(normalizedMetrics.compliance, dimensionWeights.compliance),
        sustainability: weightedAverage(normalizedMetrics.sustainability, dimensionWeights.sustainability),
      }
      const overallHealth = weightedAverage(dimensionScores, overallWeights)
      const activeFlags = [...supplier.activeFlags]
      if (singleSourceSupplierIds.has(supplier.id)) {
        activeFlags.push('Single-source dependency')
      }
      // Add document-driven flags so missing compliance records are visible at a glance.
      const missingDocuments = supplier.complianceDocuments.filter((document) => document.status === 'missing')
      if (missingDocuments.length > 0) {
        missingDocuments.forEach((document) => {
          activeFlags.push(`Compliance document missing: ${document.title}`)
        })
      } else {
        activeFlags.push('Compliance report on file')
      }
      const dedupedFlags = [...new Set(activeFlags)]

      return { ...supplier, normalizedMetrics, dimensionScores, overallHealth, activeFlags: dedupedFlags }
    })

    const supplierById = supplierScores.reduce((acc, supplier) => {
      acc[supplier.id] = supplier
      return acc
    }, {})

    const materialScores = materialsData.map((material) => {
      const weights = materialSupplierWeights[material.id] || getEqualWeights(material.suppliers.map((entry) => entry.supplierId))
      const valueMap = material.suppliers.reduce((acc, entry) => {
        acc[entry.supplierId] = supplierById[entry.supplierId].overallHealth
        return acc
      }, {})
      return {
        ...material,
        isSingleSource: singleSourceMaterialIds.has(material.id),
        materialHealth: weightedAverage(valueMap, weights),
      }
    })

    return { supplierScores, supplierById, materialScores }
  }, [dimensionWeights, overallWeights, materialSupplierWeights, materialsData, suppliersData])

  const selectedSupplier = derived.supplierById[selectedSupplierId]
  const selectedMaterial = derived.materialScores.find((material) => material.id === selectedMaterialId)
  const selectedDimensionConfig = selectedDimensionKey ? DIMENSION_CONFIG[selectedDimensionKey] : null

  // Generate exception list from raw records and computed scores.
  const exceptions = useMemo(() => {
    const today = new Date()
    const allExceptions = []
    // Build hidden supplier->materials mapping so material filters can include supplier exceptions too.
    const supplierToMaterialIds = materialsData.reduce((acc, material) => {
      material.suppliers.forEach((entry) => {
        if (!acc[entry.supplierId]) acc[entry.supplierId] = []
        acc[entry.supplierId].push(material.id)
      })
      return acc
    }, {})

    derived.supplierScores.forEach((supplier) => {
      const [lowestDimensionKey, lowestDimensionValue] = getLowestDimension(supplier.dimensionScores)
      const relatedMaterialIds = supplierToMaterialIds[supplier.id] || []
      if (supplier.overallHealth < 60) {
        allExceptions.push({
          id: `supplier-at-risk-${supplier.id}`,
          entityType: 'supplier',
          entityId: supplier.id,
          entityName: supplier.name,
          label: 'Supplier At Risk',
          severity: 'Critical',
          detectedDate: EXCEPTION_DETECTED_DATES.supplierAtRisk,
          description: `${supplier.name} has an overall health score of ${formatPercent(supplier.overallHealth)}, below the risk threshold of 60.`,
          recommendedAction: 'Set up a call this week and agree on a simple recovery plan.',
          notificationRecipientName: supplier.name,
          relatedSupplierId: supplier.id,
          relatedDimensionKey: 'risk',
          relatedMaterialIds,
          detailCards: buildExceptionCards({
            check: 'Overall Health',
            currentValue: formatPercent(supplier.overallHealth),
            trigger: 'overall health is below 60',
            context: `Lowest dimension is ${DIMENSION_CONFIG[lowestDimensionKey].label} at ${formatPercent(lowestDimensionValue)}.`,
          }),
        })
      }

      // This uses raw count intentionally (independent from normalization/scoring pipeline).
      if (supplier.compliance.openCorrectiveActions > 3) {
        allExceptions.push({
          id: `compliance-gap-${supplier.id}`,
          entityType: 'supplier',
          entityId: supplier.id,
          entityName: supplier.name,
          label: 'Compliance Gap',
          severity: 'Warning',
          detectedDate: EXCEPTION_DETECTED_DATES.complianceGap,
          description: `${supplier.name} currently has ${supplier.compliance.openCorrectiveActions} open corrective actions, exceeding the allowed threshold.`,
          recommendedAction: 'Ask the supplier to close the oldest corrective actions first.',
          notificationRecipientName: supplier.name,
          relatedSupplierId: supplier.id,
          relatedDimensionKey: 'compliance',
          relatedMaterialIds,
          detailCards: buildExceptionCards({
            check: 'Open Corrective Actions',
            currentValue: String(supplier.compliance.openCorrectiveActions),
            trigger: 'open corrective actions are greater than 3',
            context: `Current count is ${supplier.compliance.openCorrectiveActions}; last audit score is ${formatPercent(supplier.compliance.lastAuditScore)}.`,
          }),
        })
      }

      const missingDocumentCount = supplier.complianceDocuments.filter((document) => document.status === 'missing').length
      if (missingDocumentCount > 0) {
        allExceptions.push({
          id: `missing-docs-${supplier.id}`,
          entityType: 'supplier',
          entityId: supplier.id,
          entityName: supplier.name,
          label: 'Compliance Documents Missing',
          severity: 'Warning',
          detectedDate: EXCEPTION_DETECTED_DATES.complianceGap,
          description: `${supplier.name} is missing ${missingDocumentCount} required compliance document(s).`,
          recommendedAction: 'Request the missing compliance documents and upload them this cycle.',
          notificationRecipientName: supplier.name,
          relatedSupplierId: supplier.id,
          relatedDimensionKey: 'compliance',
          relatedMaterialIds,
          detailCards: buildExceptionCards({
            check: 'Required Compliance Documents',
            currentValue: `${missingDocumentCount} missing`,
            trigger: 'one or more required compliance documents are missing',
            context: 'Missing records reduce compliance visibility and raise audit follow-up risk.',
          }),
        })
      }

      if (supplier.dimensionScores.compliance < 65) {
        allExceptions.push({
          id: `audit-action-${supplier.id}`,
          entityType: 'supplier',
          entityId: supplier.id,
          entityName: supplier.name,
          label: 'Audit Action Required',
          severity: 'Warning',
          detectedDate: EXCEPTION_DETECTED_DATES.auditActionRequired,
          description: `${supplier.name} has a compliance score of ${formatPercent(supplier.dimensionScores.compliance)}, indicating elevated audit and control risk.`,
          recommendedAction: 'Schedule a compliance check-in and confirm the top 3 fixes.',
          notificationRecipientName: supplier.name,
          relatedSupplierId: supplier.id,
          relatedDimensionKey: 'compliance',
          relatedMaterialIds,
          detailCards: buildExceptionCards({
            check: 'Compliance Score',
            currentValue: formatPercent(supplier.dimensionScores.compliance),
            trigger: 'compliance score is below 65',
            context: `${supplier.compliance.certificationsHeld} certifications are currently on file.`,
          }),
        })
      }

      if (supplier.dimensionScores.sustainability < 50) {
        allExceptions.push({
          id: `sustainability-review-${supplier.id}`,
          entityType: 'supplier',
          entityId: supplier.id,
          entityName: supplier.name,
          label: 'Sustainability Review Needed',
          severity: 'Watch',
          detectedDate: EXCEPTION_DETECTED_DATES.sustainabilityReviewNeeded,
          description: `${supplier.name} has a sustainability score of ${formatPercent(supplier.dimensionScores.sustainability)}, below the watch threshold.`,
          recommendedAction: 'Request a basic sustainability update and next-step timeline.',
          notificationRecipientName: supplier.name,
          relatedSupplierId: supplier.id,
          relatedDimensionKey: 'sustainability',
          relatedMaterialIds,
          detailCards: buildExceptionCards({
            check: 'Sustainability Score',
            currentValue: formatPercent(supplier.dimensionScores.sustainability),
            trigger: 'sustainability score is below 50',
            context: `Emissions data is ${supplier.sustainability.emissionsDataAvailable ? 'available' : 'missing'} for this supplier.`,
          }),
        })
      }
    })

    derived.materialScores.forEach((material) => {
      if (material.isSingleSource) {
        const soleSupplier = derived.supplierById[material.suppliers[0].supplierId]
        allExceptions.push({
          id: `single-source-${material.id}`,
          entityType: 'material',
          entityId: material.id,
          entityName: material.name,
          label: 'Supply Continuity Risk',
          severity: 'Critical',
          detectedDate: EXCEPTION_DETECTED_DATES.supplyContinuityRisk,
          description: `${material.name} is currently supplied by a single source (${soleSupplier.name}), creating continuity exposure.`,
          recommendedAction: 'Identify one backup supplier option for this material.',
          notificationRecipientName: soleSupplier.name,
          relatedSupplierId: soleSupplier.id,
          relatedDimensionKey: 'risk',
          materialName: material.name,
          relatedMaterialIds: [material.id],
          detailCards: buildExceptionCards({
            check: 'Supplier Coverage',
            currentValue: '1 supplier',
            trigger: 'a material has only one active supplier',
            context: `${material.name} is currently sourced only from ${soleSupplier.name}.`,
          }),
        })
      }

      // Contract expiry is checked per supplier-material contract for full exception coverage.
      material.suppliers.forEach((entry) => {
        const endDate = new Date(entry.contractEndDate)
        const daysToEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysToEnd >= 0 && daysToEnd < 90) {
          const supplier = derived.supplierById[entry.supplierId]
          allExceptions.push({
            id: `contract-expiring-${material.id}-${entry.supplierId}`,
            entityType: 'supplier',
            entityId: supplier.id,
            entityName: supplier.name,
            label: 'Contract Expiring Soon',
            severity: 'Warning',
            detectedDate: EXCEPTION_DETECTED_DATES.contractExpiringSoon,
            description: `Contract coverage for ${supplier.name} on ${material.name} ends in ${daysToEnd} days (${entry.contractEndDate}).`,
            recommendedAction: 'Start the renewal conversation now to avoid a gap.',
            notificationRecipientName: supplier.name,
            relatedSupplierId: supplier.id,
            relatedDimensionKey: 'performance',
            relatedMaterialIds: [material.id],
            detailCards: buildExceptionCards({
              check: 'Contract End Date',
              currentValue: `${daysToEnd} days remaining`,
              trigger: 'contract end date is within the next 90 days',
              context: `${material.name} contract ends on ${entry.contractEndDate} with ${entry.quotaAllocation}% allocation.`,
            }),
          })
        }
      })
    })

    return allExceptions
  }, [derived, materialsData])

  const filteredExceptions = useMemo(
    () => {
      return exceptions.filter((entry) => {
        const severityMatch = selectedExceptionFilter === 'All' || entry.severity === selectedExceptionFilter
        const supplierMatch =
          selectedSupplierExceptionFilter === 'all' || entry.relatedSupplierId === selectedSupplierExceptionFilter
        // Material filter only applies to material exceptions.
        const materialMatch =
          selectedMaterialExceptionFilter === 'all' ||
          entry.relatedMaterialIds?.includes(selectedMaterialExceptionFilter)
        return severityMatch && supplierMatch && materialMatch
      })
    },
    [exceptions, selectedExceptionFilter, selectedSupplierExceptionFilter, selectedMaterialExceptionFilter],
  )

  const effectiveSelectedExceptionId =
    selectedExceptionId && filteredExceptions.some((entry) => entry.id === selectedExceptionId)
      ? selectedExceptionId
      : (filteredExceptions[0]?.id ?? null)
  const selectedException = filteredExceptions.find((entry) => entry.id === effectiveSelectedExceptionId) || null
  const selectedExceptionSupplier =
    selectedException?.relatedSupplierId ? derived.supplierById[selectedException.relatedSupplierId] : null
  const exceptionCounts = useMemo(
    () =>
      exceptions.reduce(
        (acc, entry) => {
          acc[entry.severity] += 1
          return acc
        },
        { Critical: 0, Warning: 0, Watch: 0 },
      ),
    [exceptions],
  )

  const summaryCards = [
    { key: 'All', label: 'All', count: exceptions.length },
    { key: 'Critical', label: 'Critical', count: exceptionCounts.Critical },
    { key: 'Warning', label: 'Warning', count: exceptionCounts.Warning },
    { key: 'Watch', label: 'Watch', count: exceptionCounts.Watch },
  ]
  const supplierFilterOptions = derived.supplierScores
  const materialFilterOptions = derived.materialScores
  const availableSuppliersForSelectedMaterial = useMemo(() => {
    if (!selectedMaterial) return []
    const existingSupplierIds = new Set(selectedMaterial.suppliers.map((entry) => entry.supplierId))
    return suppliersData.filter((supplier) => !existingSupplierIds.has(supplier.id))
  }, [selectedMaterial, suppliersData])

  const updateDimensionWeight = (dimension, key, value) => {
    setDimensionWeights((prev) => ({
      ...prev,
      [dimension]: rebalanceGroupWeights(prev[dimension], key, value),
    }))
  }

  const updateOverallWeight = (key, value) => {
    setOverallWeights((prev) => rebalanceGroupWeights(prev, key, value))
  }

  const updateMaterialWeight = (materialId, supplierId, value) => {
    setMaterialSupplierWeights((prev) => ({
      ...prev,
      [materialId]: rebalanceGroupWeights(prev[materialId], supplierId, value),
    }))
  }

  // Shared navigation helper used when drilling down from material suppliers.
  const goToSupplier = (supplierId) => {
    setSelectedSupplierId(supplierId)
    setView('supplier')
  }

  const openAddSupplierModal = () => {
    if (!selectedMaterial || availableSuppliersForSelectedMaterial.length === 0) return
    setAddSupplierForm({
      supplierId: availableSuppliersForSelectedMaterial[0].id,
      contractStartDate: '',
      contractEndDate: '',
      contractValue: '',
      quotaAllocation: '',
      minimumOrderQuantity: '',
      paymentTerms: 'Net 45',
    })
    setAddSupplierError('')
    setIsAddSupplierModalOpen(true)
  }

  const closeAddSupplierModal = () => {
    setIsAddSupplierModalOpen(false)
    setAddSupplierError('')
  }

  const submitAddSupplier = () => {
    if (!selectedMaterial) return
    const {
      supplierId,
      contractStartDate,
      contractEndDate,
      contractValue,
      quotaAllocation,
      minimumOrderQuantity,
      paymentTerms,
    } = addSupplierForm

    if (
      !supplierId ||
      !contractStartDate ||
      !contractEndDate ||
      !contractValue ||
      !quotaAllocation ||
      !minimumOrderQuantity ||
      !paymentTerms
    ) {
      setAddSupplierError('Please complete all fields.')
      return
    }
    if (new Date(contractStartDate) >= new Date(contractEndDate)) {
      setAddSupplierError('Contract end date must be after the start date.')
      return
    }

    const parsedContractValue = Number(contractValue)
    const parsedQuota = Number(quotaAllocation)
    const parsedMOQ = Number(minimumOrderQuantity)
    if (parsedContractValue <= 0 || parsedQuota <= 0 || parsedMOQ <= 0) {
      setAddSupplierError('Contract value, quota, and MOQ must be greater than zero.')
      return
    }
    if (parsedQuota > 100) {
      setAddSupplierError('Quota allocation cannot exceed 100%.')
      return
    }

    const nextEntry = {
      supplierId,
      contractStartDate,
      contractEndDate,
      contractValue: parsedContractValue,
      quotaAllocation: parsedQuota,
      minimumOrderQuantity: parsedMOQ,
      paymentTerms,
    }
    // Rebalance existing quotas proportionally so the new supplier takes exactly `parsedQuota`.
    const remainingQuota = 100 - parsedQuota
    const existingTotalQuota = selectedMaterial.suppliers.reduce(
      (sum, entry) => sum + Number(entry.quotaAllocation || 0),
      0,
    )
    let rebalancedExistingSuppliers
    if (selectedMaterial.suppliers.length === 0) {
      rebalancedExistingSuppliers = []
    } else if (existingTotalQuota <= 0) {
      // Fallback: if previous quotas were all 0, split remainder equally.
      const evenShare = Math.floor(remainingQuota / selectedMaterial.suppliers.length)
      const remainder = remainingQuota - evenShare * selectedMaterial.suppliers.length
      rebalancedExistingSuppliers = selectedMaterial.suppliers.map((entry, index) => ({
        ...entry,
        quotaAllocation: evenShare + (index < remainder ? 1 : 0),
      }))
    } else {
      rebalancedExistingSuppliers = selectedMaterial.suppliers.map((entry) => ({
        ...entry,
        quotaAllocation: Math.round((entry.quotaAllocation / existingTotalQuota) * remainingQuota),
      }))
      // Correct rounding drift so total existing quota exactly matches `remainingQuota`.
      const drift =
        remainingQuota - rebalancedExistingSuppliers.reduce((sum, entry) => sum + entry.quotaAllocation, 0)
      if (drift !== 0 && rebalancedExistingSuppliers.length > 0) {
        rebalancedExistingSuppliers[0].quotaAllocation += drift
      }
    }

    const updatedSuppliers = [...rebalancedExistingSuppliers, nextEntry]
    setMaterialsData((prev) =>
      prev.map((material) =>
        material.id === selectedMaterial.id ? { ...material, suppliers: updatedSuppliers } : material,
      ),
    )
    // Keep supplier-weight sliders aligned to the newly rebalanced quota mix.
    const nextWeights = updatedSuppliers.reduce((acc, entry) => {
      acc[entry.supplierId] = entry.quotaAllocation
      return acc
    }, {})
    setMaterialSupplierWeights((prev) => ({
      ...prev,
      [selectedMaterial.id]: nextWeights,
    }))
    closeAddSupplierModal()
  }

  const openAddNewSupplierModal = () => {
    setNewSupplierForm({
      name: '',
      country: SUPPLIER_COUNTRY_OPTIONS[0],
      category: SUPPLIER_CATEGORY_OPTIONS[0],
      tier: 'Tier 2',
      annualSpend: '',
      lastAuditDate: '',
      documents: REQUIRED_COMPLIANCE_DOCUMENTS.reduce((acc, doc) => {
        acc[doc.id] = false
        return acc
      }, {}),
    })
    setNewSupplierError('')
    setIsAddNewSupplierModalOpen(true)
  }

  const closeAddNewSupplierModal = () => {
    setIsAddNewSupplierModalOpen(false)
    setNewSupplierError('')
  }

  const submitNewSupplier = () => {
    const { name, country, category, tier, annualSpend, lastAuditDate, documents } = newSupplierForm
    if (!name || !country || !category || !tier || !annualSpend || !lastAuditDate) {
      setNewSupplierError('Please complete all supplier profile fields.')
      return
    }
    const spendValue = Number(annualSpend)
    if (spendValue <= 0) {
      setNewSupplierError('Annual spend must be greater than zero.')
      return
    }

    const supplierId = `custom-${Date.now()}`
    const complianceDocuments = REQUIRED_COMPLIANCE_DOCUMENTS.map((doc) => ({
      id: `${supplierId}-${doc.id}`,
      title: doc.title,
      type: doc.type,
      status: documents[doc.id] ? 'available' : 'missing',
      ...(documents[doc.id]
        ? {
            fileUrl: '/sample-compliance-report.pdf',
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
        : {}),
    }))

    // New suppliers start with neutral baseline metrics and optional docs from onboarding form.
    const nextSupplier = {
      id: supplierId,
      name,
      country,
      category,
      tier,
      annualSpend: spendValue,
      lastAuditDate,
      activeFlags: ['New supplier onboarding'],
      complianceDocuments,
      performance: { onTimeDelivery: 75, fillRate: 78, defectRate: 12, invoiceAccuracy: 82 },
      risk: { financialHealth: 72, geographicConcentration: 65, backupSupplierExists: true },
      compliance: { lastAuditScore: 76, certificationsHeld: 2, openCorrectiveActions: 3, regulatoryIncidents: 8 },
      sustainability: { emissionsDataAvailable: false, renewableEnergyUsage: 35, laborCertificationsHeld: false, wasteTargetsCommitted: false },
    }

    setSuppliersData((prev) => [...prev, nextSupplier])
    setSelectedSupplierId(supplierId)
    closeAddNewSupplierModal()
  }

  const openNotificationModal = (exception) => setNotificationTarget(exception)
  const closeNotificationModal = () => setNotificationTarget(null)
  const sendNotification = () => {
    if (!notificationTarget) return
    setNotifiedByExceptionId((prev) => ({
      ...prev,
      [notificationTarget.id]: new Date().toISOString(),
    }))
    closeNotificationModal()
  }

  // Allow keyboard dismissal for the detail modal.
  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedDimensionKey(null)
        setNotificationTarget(null)
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-mark">SI</div>
          <div>
            <h1>Supplier Intelligence Dashboard</h1>
            <p>Procurement SRM command center</p>
          </div>
          <a
            className="docs-link-button"
            href="https://github.com/kookoobear9/KodiakHubDemo/tree/main/docs"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </div>
        <div className="view-toggle" role="tablist" aria-label="Dashboard views">
          <button type="button" className={view === 'supplier' ? 'active' : ''} onClick={() => setView('supplier')}>
            Supplier View
          </button>
          <button type="button" className={view === 'material' ? 'active' : ''} onClick={() => setView('material')}>
            Material View
          </button>
          <button type="button" className={view === 'exceptions' ? 'active' : ''} onClick={() => setView('exceptions')}>
            Exceptions
          </button>
        </div>
        <button type="button" className="weights-button" onClick={() => setIsDrawerOpen(true)}>
          Configure Weights
        </button>
      </header>

      <main className="content-grid">
        {view === 'supplier' ? (
          <>
            <section className="panel list-panel">
              <div className="panel-heading-row">
                <h2>Suppliers</h2>
                <button type="button" className="go-supplier-button" onClick={openAddNewSupplierModal}>
                  Add Supplier
                </button>
              </div>
              <div className="list-body">
                {derived.supplierScores.map((supplier) => (
                  <button
                    key={supplier.id}
                    type="button"
                    className={`list-row ${supplier.id === selectedSupplierId ? 'selected' : ''}`}
                    onClick={() => setSelectedSupplierId(supplier.id)}
                  >
                    <div>
                      <h3>{supplier.name}</h3>
                      <p>{supplier.category} • {supplier.country}</p>
                    </div>
                    <div className="row-score">
                      <strong>{formatPercent(supplier.overallHealth)}</strong>
                      <span className={`status-badge ${getStatusLabel(supplier.overallHealth).toLowerCase().replace(' ', '-')}`}>
                        {getStatusLabel(supplier.overallHealth)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel detail-panel">
              <div className="detail-header">
                <div>
                  <h2>{selectedSupplier.name}</h2>
                  <p>{selectedSupplier.tier} • {selectedSupplier.country} • {selectedSupplier.category}</p>
                  <p>Annual spend: {formatCurrency(selectedSupplier.annualSpend)} • Last audit: {selectedSupplier.lastAuditDate}</p>
                </div>
                <div className="hero-score">
                  <span>Overall Health</span>
                  <strong>{formatPercent(selectedSupplier.overallHealth)}</strong>
                  <span className={`status-badge ${getStatusLabel(selectedSupplier.overallHealth).toLowerCase().replace(' ', '-')}`}>
                    {getStatusLabel(selectedSupplier.overallHealth)}
                  </span>
                </div>
              </div>

              <div className="dimension-grid">
                {Object.keys(DIMENSION_CONFIG).map((dimensionKey) => {
                  const score = selectedSupplier.dimensionScores[dimensionKey]
                  return (
                    <button
                      key={dimensionKey}
                      type="button"
                      className="score-card score-card-button"
                      onClick={() => setSelectedDimensionKey(dimensionKey)}
                    >
                      <p>{DIMENSION_CONFIG[dimensionKey].label}</p>
                      <strong>{formatPercent(score)}</strong>
                      <span className={`status-badge ${getStatusLabel(score).toLowerCase().replace(' ', '-')}`}>
                        {getStatusLabel(score)}
                      </span>
                      <ul className="dimension-breakdown">
                        {DIMENSION_CONFIG[dimensionKey].metrics.map((metricKey) => (
                          <li key={metricKey}>
                            <span>{DIMENSION_CONFIG[dimensionKey].metricLabels[metricKey]}</span>
                            <em>
                              {formatPercent(selectedSupplier.normalizedMetrics[dimensionKey][metricKey])} @ {dimensionWeights[dimensionKey][metricKey]}%
                            </em>
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>

              <div className="flags-section">
                <h3>Active Flags</h3>
                {selectedSupplier.activeFlags.length === 0 ? (
                  <p>No active flags.</p>
                ) : (
                  <ul>
                    {selectedSupplier.activeFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="documents-section">
                <h3>Compliance Documents</h3>
                <div className="documents-grid">
                  {selectedSupplier.complianceDocuments.map((document) => (
                    <article key={document.id} className="document-card">
                      <div className="document-head">
                        <div>
                          <p className="document-title">{document.title}</p>
                          <p className="document-type">{document.type}</p>
                        </div>
                        <span className={`document-status ${document.status}`}>
                          {document.status === 'available' ? 'Available' : 'Missing'}
                        </span>
                      </div>
                      {document.status === 'available' ? (
                        <div className="document-actions">
                          {document.lastUpdated && <p>Last updated: {document.lastUpdated}</p>}
                          <a href={document.fileUrl} target="_blank" rel="noreferrer">
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <p className="document-missing-copy">Not on file</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : view === 'material' ? (
          <>
            <section className="panel list-panel">
              <h2>Materials</h2>
              <div className="list-body">
                {derived.materialScores.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    className={`list-row ${material.id === selectedMaterialId ? 'selected' : ''}`}
                    onClick={() => setSelectedMaterialId(material.id)}
                  >
                    <div>
                      <h3>{material.name}</h3>
                      <p>{material.category}</p>
                    </div>
                    <div className="row-score">
                      <strong>{formatPercent(material.materialHealth)}</strong>
                      {material.isSingleSource && <span className="chip">Single-source</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel detail-panel">
              <div className="detail-header">
                <div>
                  <h2>{selectedMaterial.name}</h2>
                  <p>{selectedMaterial.category} • {selectedMaterial.unitOfMeasure} • Annual volume {selectedMaterial.annualVolume.toLocaleString()}</p>
                </div>
                <div className="hero-score">
                  <span>Material Health</span>
                  <strong>{formatPercent(selectedMaterial.materialHealth)}</strong>
                  <span className={`status-badge ${getStatusLabel(selectedMaterial.materialHealth).toLowerCase().replace(' ', '-')}`}>
                    {getStatusLabel(selectedMaterial.materialHealth)}
                  </span>
                </div>
              </div>
              <div className="material-actions">
                <button
                  type="button"
                  className="go-supplier-button"
                  onClick={openAddSupplierModal}
                  disabled={availableSuppliersForSelectedMaterial.length === 0}
                >
                  {availableSuppliersForSelectedMaterial.length === 0 ? 'All suppliers already added' : 'Add Supplier'}
                </button>
              </div>

              {selectedMaterial.isSingleSource && (
                <div className="warning-banner">Single-source risk: this material currently relies on one supplier.</div>
              )}

              <div className="supplier-contract-list">
                {selectedMaterial.suppliers.map((entry) => {
                  const supplier = derived.supplierById[entry.supplierId]
                  return (
                    <button
                      key={entry.supplierId}
                      type="button"
                      className="contract-card contract-card-button"
                      onClick={() => goToSupplier(entry.supplierId)}
                    >
                      <div className="contract-head">
                        <div>
                          <h3>{supplier.name}</h3>
                          <p>Overall health {formatPercent(supplier.overallHealth)}</p>
                        </div>
                        <span className={`status-badge ${getStatusLabel(supplier.overallHealth).toLowerCase().replace(' ', '-')}`}>
                          {getStatusLabel(supplier.overallHealth)}
                        </span>
                      </div>
                      <p>Contract: {entry.contractStartDate} to {entry.contractEndDate} • {formatCurrency(entry.contractValue)}</p>
                      <p>Payment terms: {entry.paymentTerms}</p>
                      <p>Quota allocation: {entry.quotaAllocation}% • MOQ: {entry.minimumOrderQuantity.toLocaleString()} {selectedMaterial.unitOfMeasure}</p>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        ) : (
          <div className="exceptions-layout">
            <section className="exceptions-filters">
              <label>
                <span>Supplier Filter</span>
                <select
                  value={selectedSupplierExceptionFilter}
                  onChange={(event) => setSelectedSupplierExceptionFilter(event.target.value)}
                >
                  <option value="all">All Suppliers</option>
                  {supplierFilterOptions.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Material Filter</span>
                <select
                  value={selectedMaterialExceptionFilter}
                  onChange={(event) => setSelectedMaterialExceptionFilter(event.target.value)}
                >
                  <option value="all">All Materials</option>
                  {materialFilterOptions.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="exceptions-summary-grid">
              {summaryCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  className={`summary-card summary-card-button ${card.key.toLowerCase()}-card ${selectedExceptionFilter === card.key ? 'selected' : ''}`}
                  onClick={() => setSelectedExceptionFilter(card.key)}
                >
                  <p>{card.label}</p>
                  <strong>{card.count}</strong>
                </button>
              ))}
            </section>

            <div className="exceptions-panels">
              <section className="panel list-panel">
                <h2>Exceptions</h2>
                <div className="list-body">
                  {filteredExceptions.map((entry) => {
                    const notifiedAt = notifiedByExceptionId[entry.id]
                    const daysOpen = getDaysOpen(entry.detectedDate, new Date())
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        className={`list-row exception-row ${entry.id === effectiveSelectedExceptionId ? 'selected' : ''}`}
                        onClick={() => setSelectedExceptionId(entry.id)}
                      >
                        <div>
                          <h3>{entry.entityName}</h3>
                          <p>{entry.label}</p>
                          <p>{daysOpen} days open</p>
                        </div>
                        <div className="row-score">
                          <span className={`status-badge ${getExceptionSeverityClass(entry.severity)}`}>{entry.severity}</span>
                          {notifiedAt && <span className="notified-badge">Notified</span>}
                        </div>
                      </button>
                    )
                  })}
                  {filteredExceptions.length === 0 && (
                    <div className="empty-state">
                      <p>No exceptions for this filter.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel detail-panel">
                {selectedException ? (
                  <div className="exception-detail">
                    <div className="detail-header">
                      <div>
                        <h2>{selectedException.entityName}</h2>
                        <p>{selectedException.label}</p>
                      </div>
                      <div className="row-score">
                        <span className={`status-badge ${getExceptionSeverityClass(selectedException.severity)}`}>{selectedException.severity}</span>
                        {notifiedByExceptionId[selectedException.id] && (
                          <span className="notified-badge">{`Notified ${formatTimestamp(notifiedByExceptionId[selectedException.id])}`}</span>
                        )}
                      </div>
                    </div>
                    <div className="exception-detail-body">
                      {selectedExceptionSupplier && (
                        <div className="exception-dimension-strip">
                          {Object.keys(DIMENSION_CONFIG).map((dimensionKey) => (
                            <article
                              key={dimensionKey}
                              className={`exception-dimension-card ${selectedException.relatedDimensionKey === dimensionKey ? 'related' : ''}`}
                            >
                              <span>{DIMENSION_CONFIG[dimensionKey].label}</span>
                              <strong>{formatPercent(selectedExceptionSupplier.dimensionScores[dimensionKey])}</strong>
                            </article>
                          ))}
                        </div>
                      )}
                      <p>{selectedException.description}</p>
                      <div className="exception-pairs-grid">
                        {selectedException.detailCards?.map((card) => (
                          <article key={card.label} className="exception-pair-item exception-clean-item">
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                          </article>
                        ))}
                      </div>
                      <p><strong>Recommended action:</strong> {selectedException.recommendedAction}</p>
                      <div className="exception-actions">
                        {selectedExceptionSupplier && (
                          <button
                            type="button"
                            className="go-supplier-button"
                            onClick={() => goToSupplier(selectedExceptionSupplier.id)}
                          >
                            Go to Supplier
                          </button>
                        )}
                        <button type="button" className="notify-button" onClick={() => openNotificationModal(selectedException)}>
                          {notifiedByExceptionId[selectedException.id] ? 'Resend' : 'Notify Supplier'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No exceptions are currently generated.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="drawer-header">
          <h2>Configure Weights</h2>
          <button type="button" onClick={() => setIsDrawerOpen(false)}>Close</button>
        </div>

        <div className="drawer-content">
          <details className="drawer-section">
            <summary>Dimension Input Weights</summary>
            <section>
              {Object.keys(DIMENSION_CONFIG).map((dimensionKey) => (
                <div key={dimensionKey} className="weight-group">
                  <h4>{DIMENSION_CONFIG[dimensionKey].label}</h4>
                  {DIMENSION_CONFIG[dimensionKey].metrics.map((metricKey) => (
                    <label key={metricKey}>
                      <span>{DIMENSION_CONFIG[dimensionKey].metricLabels[metricKey]}</span>
                      <div className="slider-row">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimensionWeights[dimensionKey][metricKey]}
                          onChange={(event) => updateDimensionWeight(dimensionKey, metricKey, event.target.value)}
                        />
                        <em>{dimensionWeights[dimensionKey][metricKey]}%</em>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
            </section>
          </details>

          <details className="drawer-section">
            <summary>Overall Health Score Weights</summary>
            <section>
              <div className="weight-group">
                {Object.keys(overallWeights).map((dimensionKey) => (
                  <label key={dimensionKey}>
                    <span>{DIMENSION_CONFIG[dimensionKey].label}</span>
                    <div className="slider-row">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={overallWeights[dimensionKey]}
                        onChange={(event) => updateOverallWeight(dimensionKey, event.target.value)}
                      />
                      <em>{overallWeights[dimensionKey]}%</em>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </details>

          <details className="drawer-section">
            <summary>Material Health Supplier Weights</summary>
            <section>
              {materialsData.map((material) => (
                <div key={material.id} className="weight-group">
                  <h4>{material.name}</h4>
                  {material.suppliers.map((entry) => {
                    const supplier = derived.supplierById[entry.supplierId]
                    return (
                      <label key={entry.supplierId}>
                        <span>{supplier.name}</span>
                        <div className="slider-row">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={materialSupplierWeights[material.id][entry.supplierId]}
                            onChange={(event) => updateMaterialWeight(material.id, entry.supplierId, event.target.value)}
                          />
                          <em>{materialSupplierWeights[material.id][entry.supplierId]}%</em>
                        </div>
                      </label>
                    )
                  })}
                </div>
              ))}
            </section>
          </details>
        </div>
      </aside>

      {selectedDimensionConfig && (
        <div className="dimension-modal-layer" role="presentation" onClick={() => setSelectedDimensionKey(null)}>
          <section
            className="dimension-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedDimensionConfig.label} details`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dimension-modal-header">
              <div>
                <h3>{selectedDimensionConfig.label} Detail</h3>
                <p>
                  Supplier: {selectedSupplier.name} • Dimension score{' '}
                  {formatPercent(selectedSupplier.dimensionScores[selectedDimensionKey])}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedDimensionKey(null)}>
                Close
              </button>
            </div>

            <div className="dimension-modal-body">
              {selectedDimensionConfig.metrics.map((metricKey) => {
                const normalizedScore = selectedSupplier.normalizedMetrics[selectedDimensionKey][metricKey]
                const weight = dimensionWeights[selectedDimensionKey][metricKey]
                const contribution = (normalizedScore * weight) / 100
                return (
                  <article key={metricKey} className="dimension-metric-card">
                    <h4>{selectedDimensionConfig.metricLabels[metricKey]}</h4>
                    <p>Normalized Score: {formatPercent(normalizedScore)}</p>
                    <p>Weight: {weight}%</p>
                    <p>Weighted Contribution: {formatPercent(contribution)}</p>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {notificationTarget && (
        <div className="dimension-modal-layer" role="presentation" onClick={closeNotificationModal}>
          <section
            className="dimension-modal notification-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Notify supplier"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dimension-modal-header">
              <div>
                <h3>Notify Supplier</h3>
                <p>{`Subject: Action Required — ${notificationTarget.label}`}</p>
              </div>
              <button type="button" onClick={closeNotificationModal}>Cancel</button>
            </div>
            <div className="dimension-modal-body notification-body">
              <p><strong>{`Subject: Action Required — ${notificationTarget.label}`}</strong></p>
              <p>{`Dear ${notificationTarget.notificationRecipientName} team,`}</p>
              <p>We are reaching out regarding a pending action item that requires your attention.</p>
              <p>
                {notificationTarget.entityType === 'material'
                  ? `Our records indicate that you are currently the sole supplier for ${notificationTarget.materialName}, representing a supply continuity risk that requires resolution.`
                  : `Our records indicate that ${notificationTarget.description.toLowerCase()} requires resolution.`}
              </p>
              <p>Please review and respond at your earliest convenience.</p>
              <p>Best regards,<br />Procurement Team</p>
            </div>
            <div className="notification-actions">
              <button type="button" onClick={closeNotificationModal}>Cancel</button>
              <button type="button" className="notify-button" onClick={sendNotification}>Send Notification</button>
            </div>
          </section>
        </div>
      )}

      {isAddSupplierModalOpen && (
        <div className="dimension-modal-layer" role="presentation" onClick={closeAddSupplierModal}>
          <section
            className="dimension-modal notification-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add supplier to material"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dimension-modal-header">
              <div>
                <h3>Add Supplier to {selectedMaterial?.name}</h3>
                <p>Create a new contract/quota entry for this material.</p>
              </div>
              <button type="button" onClick={closeAddSupplierModal}>Cancel</button>
            </div>
            <div className="dimension-modal-body add-supplier-form">
              <label>
                <span>Supplier</span>
                <select
                  value={addSupplierForm.supplierId}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, supplierId: event.target.value }))}
                >
                  {availableSuppliersForSelectedMaterial.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Contract Start Date</span>
                <input
                  type="date"
                  value={addSupplierForm.contractStartDate}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, contractStartDate: event.target.value }))}
                />
              </label>
              <label>
                <span>Contract End Date</span>
                <input
                  type="date"
                  value={addSupplierForm.contractEndDate}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, contractEndDate: event.target.value }))}
                />
              </label>
              <label>
                <span>Contract Value (USD)</span>
                <input
                  type="number"
                  min="1"
                  value={addSupplierForm.contractValue}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, contractValue: event.target.value }))}
                />
              </label>
              <label>
                <span>Quota Allocation %</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={addSupplierForm.quotaAllocation}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, quotaAllocation: event.target.value }))}
                />
              </label>
              <label>
                <span>Minimum Order Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={addSupplierForm.minimumOrderQuantity}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, minimumOrderQuantity: event.target.value }))}
                />
              </label>
              <label>
                <span>Payment Terms</span>
                <input
                  type="text"
                  value={addSupplierForm.paymentTerms}
                  onChange={(event) => setAddSupplierForm((prev) => ({ ...prev, paymentTerms: event.target.value }))}
                />
              </label>
              {addSupplierError && <p className="form-error">{addSupplierError}</p>}
            </div>
            <div className="notification-actions">
              <button type="button" onClick={closeAddSupplierModal}>Cancel</button>
              <button type="button" className="notify-button" onClick={submitAddSupplier}>Add Supplier</button>
            </div>
          </section>
        </div>
      )}

      {isAddNewSupplierModalOpen && (
        <div className="dimension-modal-layer" role="presentation" onClick={closeAddNewSupplierModal}>
          <section
            className="dimension-modal notification-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add new supplier"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dimension-modal-header">
              <div>
                <h3>Add New Supplier</h3>
                <p>Create a supplier profile with optional compliance documents.</p>
              </div>
              <button type="button" onClick={closeAddNewSupplierModal}>Cancel</button>
            </div>
            <div className="dimension-modal-body add-supplier-form">
              <label>
                <span>Supplier Name</span>
                <input
                  type="text"
                  value={newSupplierForm.name}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label>
                <span>Country</span>
                <select
                  value={newSupplierForm.country}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, country: event.target.value }))}
                >
                  {SUPPLIER_COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select
                  value={newSupplierForm.category}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {SUPPLIER_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Tier</span>
                <select
                  value={newSupplierForm.tier}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, tier: event.target.value }))}
                >
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                </select>
              </label>
              <label>
                <span>Annual Spend (USD)</span>
                <input
                  type="number"
                  min="1"
                  value={newSupplierForm.annualSpend}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, annualSpend: event.target.value }))}
                />
              </label>
              <label>
                <span>Last Audit Date</span>
                <input
                  type="date"
                  value={newSupplierForm.lastAuditDate}
                  onChange={(event) => setNewSupplierForm((prev) => ({ ...prev, lastAuditDate: event.target.value }))}
                />
              </label>

              <div className="document-checklist">
                <p>Required Compliance Documents (optional at creation)</p>
                {REQUIRED_COMPLIANCE_DOCUMENTS.map((doc) => (
                  <label key={doc.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={newSupplierForm.documents[doc.id]}
                      onChange={(event) =>
                        setNewSupplierForm((prev) => ({
                          ...prev,
                          documents: { ...prev.documents, [doc.id]: event.target.checked },
                        }))
                      }
                    />
                    <span>{doc.title}</span>
                  </label>
                ))}
              </div>
              {newSupplierError && <p className="form-error">{newSupplierError}</p>}
            </div>
            <div className="notification-actions">
              <button type="button" onClick={closeAddNewSupplierModal}>Cancel</button>
              <button type="button" className="notify-button" onClick={submitNewSupplier}>Create Supplier</button>
            </div>
          </section>
        </div>
      )}

      {isDrawerOpen && <button type="button" className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} aria-label="Close drawer overlay" />}
    </div>
  )
}

export default App
