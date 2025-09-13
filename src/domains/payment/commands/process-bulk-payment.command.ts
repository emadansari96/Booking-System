export class ProcessBulkPaymentCommand {
  constructor(
    public readonly userId: string,
    public readonly items: Array<{
      resourceId: string;
      resourceItemId?: string;
      resourceType: string;
      basePrice: number;
      bookingDurationHours: number;
      startDate: Date;
      endDate: Date;
      description?: string;
      metadata?: Record<string, any>;
    }>,
    public readonly currency: string,
    public readonly paymentMethod: string,
    public readonly dueDate: Date,
    public readonly taxRate?: number,
    public readonly discountAmount?: number,
    public readonly notes?: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
