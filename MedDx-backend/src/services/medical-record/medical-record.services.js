class MedicalRecordService {
  constructor(model) {
    this.model = model
  }

  async findByPatientId(patientId) {
    return await this.model.findOne({ patientId })
  }

  async getOrCreate(patientId) {
    let record = await this.model.findOne({ patientId })
    if (record) return record
    record = await this.model.create({
      patientId,
      conditions: [],
      allergies: [],
      medications: [],
      consultations: [],
      auditLog: [],
    })
    return record
  }

  async appendConsultation({ patientId, entry }) {
    const record = await this.getOrCreate(patientId)
    record.consultations.push(entry)
    await record.save()
    return record
  }

  async appendAudit({ patientId, viewerId }) {
    const record = await this.getOrCreate(patientId)
    record.auditLog.push({ viewerId, viewedAt: new Date() })
    await record.save()
    return record
  }

  async findByPatientIdPopulated(patientId) {
    return await this.model
      .findOne({ patientId })
      .populate('consultations.doctorId', 'name email specialty')
      .populate('auditLog.viewerId', 'name email role')
  }
}

export default MedicalRecordService
