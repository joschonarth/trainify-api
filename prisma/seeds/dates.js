import dayjsInstance from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

dayjsInstance.extend(utc)
dayjsInstance.extend(timezone)

export const dayjs = dayjsInstance
