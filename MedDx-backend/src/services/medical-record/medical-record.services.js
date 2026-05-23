/**
 * Medical records belong to EITHER a registered patient (`patientId`) OR a
 * village patient profile (`villagePatientId`). Every method that works with
 * "the record" accepts a subject of the form `{ patientId }` or
 * `{ villagePatientId }` and routes to the right query.
 */
const subjectFilter = (subject) => {
  if (subject.villagePatientId) {
    return { villagePatientId: subject.villagePatientId }
  }
  return { patientId: subject.patientId }
}

class MedicalRecordService {
  constructor(model) {
    this.model = model
  }

  async findBySubject(subject) {
    return await this.model.findOne(subjectFilter(subject))
  }

  async getOrCreate(subject) {
    const filter = subjectFilter(subject)
    let record = await this.model.findOne(filter)
    if (record) return record
    record = await this.model.create({
      ...filter,
      conditions: [],
      allergies: [],
      medications: [],
      consultations: [],
      auditLog: [],
    })
    return record
  }

  async appendConsultation({ patientId, villagePatientId, entry }) {
    const record = await this.getOrCreate(
      villagePatientId ? { villagePatientId } : { patientId }
    )
    record.consultations.push(entry)
    await record.save()
    return record
  }

  async appendAudit({ patientId, villagePatientId, viewerId, note }) {
    const record = await this.getOrCreate(
      villagePatientId ? { villagePatientId } : { patientId }
    )
    record.auditLog.push({
      viewerId,
      viewedAt: new Date(),
      note: note || null,
    })
    await record.save()
    return record
  }

  async findBySubjectPopulated(subject) {
    return await this.model
      .findOne(subjectFilter(subject))
      .populate('consultations.doctorId', 'name email specialty')
      .populate('consultations.bookedByAshaId', 'name village ashaIdNumber')
      .populate('auditLog.viewerId', 'name email role')
  }

  // ── Legacy single-arg shims so existing callers don't have to change ──
  // (medical-record controller, appointment controller still pass patientId)
  async findByPatientId(patientId) {
    return this.findBySubject({ patientId })
  }
  async findByPatientIdPopulated(patientId) {
    return this.findBySubjectPopulated({ patientId })
  }
}

export default MedicalRecordService
