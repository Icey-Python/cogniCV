import { Document, model, Schema } from 'mongoose'

interface SiteSettingsDoc extends Document {
  allowSignup: boolean
  isMaintenance: boolean
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    allowSignup: {
      type: Boolean,
      default: true,
    },
    isMaintenance: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const SiteSettings = model<SiteSettingsDoc>('Settings', SiteSettingsSchema)

export default SiteSettings
