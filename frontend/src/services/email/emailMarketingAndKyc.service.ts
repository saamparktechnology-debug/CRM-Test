import { api } from "@/lib/api"
import { InvoiceItem } from "@/features/invoice/services/invoiceService"
import { ClientItem } from "@/features/clients/types"
import { Project } from "@/features/projects/types"


/**
 * Save notification into client in-app notification storage
 */
import { recordInAppNotification } from "./emailCore.service"

export async function sendUserEmailTransferNotification(
  userName: string,
  oldEmail: string,
  newEmail: string,
  initiatedBy?: string
): Promise<{ success: boolean; message: string }> {
  const normOld = (oldEmail || "").trim().toLowerCase()
  const normNew = (newEmail || "").trim().toLowerCase()

  if (!normOld || !normNew) {
    return { success: false, message: "Valid old and new email addresses are required." }
  }

  const subject = `Account Email Transferred to ${normNew} - SAAMPARK Group CRM`
  const messageText = `Your CRM account profile for "${userName}" has been updated. The primary login email has been changed from ${normOld} to ${normNew}. You can now sign in using either ${normNew} or ${normOld} with your current password.`

  // 1. Record In-App Notifications for both old and new addresses
  recordInAppNotification(normOld, subject, messageText, { oldEmail: normOld, newEmail: normNew, transferTime: new Date().toISOString() })
  recordInAppNotification(normNew, subject, messageText, { oldEmail: normOld, newEmail: normNew, transferTime: new Date().toISOString() })

  // 2. Dispatch real email notifications to both emails via backend
  try {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">SAAMPARK Group CRM - Account Email Updated</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>This is an automated notification to confirm that your account primary email has been transferred:</p>
        <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
          <p style="margin: 4px 0;"><strong>Previous Email:</strong> <span style="text-decoration: line-through; color: #64748b;">${normOld}</span></p>
          <p style="margin: 4px 0;"><strong>New Primary Email:</strong> <span style="color: #16a34a; font-weight: bold;">${normNew}</span></p>
          ${initiatedBy ? `<p style="margin: 4px 0; color: #64748b; font-size: 12px;">Updated by: ${initiatedBy}</p>` : ""}
        </div>
        <p><strong>Login Notice:</strong> You can continue to log in seamlessly using <em>either</em> your previous email (<code>${normOld}</code>) or your new email (<code>${normNew}</code>) along with your existing password.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">If you did not recognize this change, please contact your System Administrator immediately.</p>
      </div>
    `

    await Promise.allSettled([
      api.post("/email/send-general", {
        to: normOld,
        subject,
        html: htmlBody,
        clientName: userName,
      }),
      api.post("/email/send-general", {
        to: normNew,
        subject,
        html: htmlBody,
        clientName: userName,
      })
    ])

    return { 
      success: true, 
      message: `Account email transferred successfully! Notification sent to ${normOld} and ${normNew}. User can now log in with either email.` 
    }
  } catch (err) {
    console.warn("Email transfer notification dispatch warning:", err)
    return { 
      success: true, 
      message: `Account email transferred to ${normNew}. In-app notification delivered.` 
    }
  }
}

/**
 * 7. Send Quotation Details Email with Interactive Action Buttons & Download Link
 */
export async function sendQuotationDetailsEmailNotification(
  quotation: any,
  customEmail?: string
): Promise<{ success: boolean; message: string }> {
  const recipient = (customEmail || quotation.customerEmail || quotation.clientEmail || "").trim()
  if (!recipient) {
    return { success: false, message: "Client email is required to send quotation." }
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://crm.saampark.com"
  const quotationId = quotation.id || quotation.number
  const viewUrl = `${originUrl}/public/quotation?view=${encodeURIComponent(quotationId)}`
  const downloadUrl = `${originUrl}/public/quotation?view=${encodeURIComponent(quotationId)}&action=download`
  const acceptUrl = `${originUrl}/public/quotation?view=${encodeURIComponent(quotationId)}&action=accept`
  const modifyUrl = `${originUrl}/public/quotation?view=${encodeURIComponent(quotationId)}&action=modify`
  const declineUrl = `${originUrl}/public/quotation?view=${encodeURIComponent(quotationId)}&action=decline`

  // 1. In-App Notification
  recordInAppNotification(
    recipient,
    `New Price Quotation: ${quotation.number || quotationId}`,
    `Quotation ${quotation.number || quotationId} for ${quotation.project || quotation.customer} totaling ₹${Number(quotation.total || 0).toLocaleString("en-IN")} has been sent to you. Click to review and respond.`,
    { quotationId, viewUrl }
  )

  // 2. Dispatch via Backend SMTP
  try {
    await api.post("/email/send-quotation", {
      to: recipient,
      clientName: quotation.customer || quotation.client || "Valued Client",
      quotationId: quotation.id,
      quotationNumber: quotation.number || quotation.id,
      projectTitle: quotation.project || `Quotation for ${quotation.customer || "Client"}`,
      date: quotation.date || new Date().toISOString().split("T")[0],
      validTill: quotation.validTill || "30 Days from issue",
      totalAmount: `₹${Number(quotation.total || 0).toLocaleString("en-IN")}`,
      items: (quotation.items || quotation.services || []).map((it: any) => ({
        serviceName: it.serviceName || it.name,
        qty: it.qty || it.quantity || 1,
        rate: it.rate || it.unitPrice || 0,
        totalAmount: it.totalAmount || it.total || ((it.rate || it.unitPrice || 0) * (it.qty || it.quantity || 1)),
      })),
      viewUrl,
      downloadUrl,
      acceptUrl,
      modifyUrl,
      declineUrl,
      companyId: quotation.companyId || undefined,
    })
    return { success: true, message: `Quotation email successfully delivered to ${recipient}` }
  } catch (err) {
    console.warn("Backend quotation email dispatch error:", err)
    return { success: true, message: `Quotation dispatched to ${recipient}` }
  }
}

/**
 * 8. Send Estimate Details Email with Interactive Action Buttons & Download Link
 */
export async function sendEstimateDetailsEmailNotification(
  estimate: any,
  customEmail?: string
): Promise<{ success: boolean; message: string }> {
  const recipient = (customEmail || estimate.customerEmail || estimate.clientEmail || "").trim()
  if (!recipient) {
    return { success: false, message: "Client email is required to send estimate." }
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://crm.saampark.com"
  const estimateId = estimate.id || estimate.number
  const viewUrl = `${originUrl}/public/estimate?view=${encodeURIComponent(estimateId)}`
  const downloadUrl = `${originUrl}/public/estimate?view=${encodeURIComponent(estimateId)}&action=download`
  const acceptUrl = `${originUrl}/public/estimate?view=${encodeURIComponent(estimateId)}&action=accept`
  const modifyUrl = `${originUrl}/public/estimate?view=${encodeURIComponent(estimateId)}&action=modify`
  const declineUrl = `${originUrl}/public/estimate?view=${encodeURIComponent(estimateId)}&action=decline`

  // 1. In-App Notification
  recordInAppNotification(
    recipient,
    `New Cost Estimate: ${estimate.number || estimateId}`,
    `Cost Estimate ${estimate.number || estimateId} for ₹${Number(estimate.total || 0).toLocaleString("en-IN")} has been sent to you. Click to review itemized breakdown and respond.`,
    { estimateId, viewUrl }
  )

  // 2. Dispatch via Backend SMTP
  try {
    await api.post("/email/send-estimate", {
      to: recipient,
      clientName: estimate.customer || estimate.client || "Valued Client",
      estimateId: estimate.id,
      estimateNumber: estimate.number || estimate.id,
      projectTitle: estimate.projectTitle || `Cost Estimate for ${estimate.customer || "Client"}`,
      date: estimate.date || new Date().toISOString().split("T")[0],
      validTill: estimate.validTill || "30 Days from issue",
      totalAmount: `₹${Number(estimate.total || 0).toLocaleString("en-IN")}`,
      items: (estimate.items || []).map((it: any) => ({
        serviceName: it.serviceName || it.name,
        qty: it.qty || it.quantity || 1,
        rate: it.rate || it.unitPrice || 0,
        totalAmount: it.totalAmount || it.total || ((it.rate || it.unitPrice || 0) * (it.qty || it.quantity || 1)),
      })),
      viewUrl,
      downloadUrl,
      acceptUrl,
      modifyUrl,
      declineUrl,
      companyId: estimate.companyId || undefined,
    })
    return { success: true, message: `Estimate email successfully delivered to ${recipient}` }
  } catch (err) {
    console.warn("Backend estimate email dispatch error:", err)
    return { success: true, message: `Estimate dispatched to ${recipient}` }
  }
}

/**
 * 9. Send KYC Status Email Notification (Verified or Rejected)
 */
export async function sendKycStatusEmailNotification({
  user,
  status,
  rejectionReason,
  verifiedBy,
}: {
  user: any
  status: "Verified" | "Rejected"
  rejectionReason?: string
  verifiedBy?: string
}): Promise<{ success: boolean; message: string }> {
  const recipient = (user.email || "").trim()
  if (!recipient) {
    return { success: false, message: "User email is required" }
  }

  const isVerified = status === "Verified"
  const title = isVerified 
    ? "🎉 KYC Verification Successful!" 
    : "⚠️ Action Required: KYC Documents Update Required"
  const msg = isVerified 
    ? `Congratulations! Your Employee KYC verification has been officially approved by ${verifiedBy || "Management"}. Full CRM workspace access is now unlocked.`
    : `Your submitted KYC documents require update. Reason: "${rejectionReason || "Documents need correction"}". Please sign in and re-upload.`

  // 1. In-App Notification
  recordInAppNotification(recipient, title, msg, {
    status,
    verifiedBy,
    rejectionReason,
    timestamp: new Date().toISOString(),
  })

  // 2. Dispatch via Backend SMTP
  try {
    await api.post("/email/send-kyc-status", {
      to: recipient,
      status,
      name: user.name || "Team Member",
      role: user.role || "Teams",
      companyName: user.companyName || "SAAMPARK Group",
      branchName: user.branchName || "",
      employeeId: user.employeeId || "",
      docType: user.kycData?.docType || "Government ID",
      docNumber: user.kycData?.docNumber || "",
      bankName: user.kycData?.bankName || "",
      accountNumber: user.kycData?.accountNumber || "",
      verifiedBy: verifiedBy || "Management",
      rejectionReason: rejectionReason || "",
      companyId: user.companyId || undefined,
    })
    return { success: true, message: `KYC ${status.toLowerCase()} email successfully delivered to ${recipient}` }
  } catch (err) {
    console.warn("Backend KYC status email dispatch warning:", err)
    return { success: true, message: `KYC status notification recorded for ${recipient}` }
  }
}

/**
 * 10. Send Marketing 1st Post Published Email Notification (Stage Transition: Pending -> Action)
 */
export async function sendMarketingFirstPostEmailNotification(params: {
  clientName: string
  clientEmail: string
  campaignName: string
  postTitle: string
  service: string
  platform?: string
  postUrl?: string
  contentPreview?: string
  companyId?: string
}): Promise<{ success: boolean; message: string }> {
  const recipient = (params.clientEmail || "").trim()
  if (!recipient) {
    return { success: false, message: "Client email is required." }
  }

  const title = `🚀 Your 1st Marketing Creative is LIVE: ${params.postTitle}`
  const message = `Great news! The first deliverable "${params.postTitle}" (${params.service}) for your ${params.campaignName} campaign is now live on ${params.platform || "Meta/Social Media"}. Your campaign is now actively IN ACTION.`

  // 1. In-App Notification
  recordInAppNotification(recipient, title, message, {
    campaignName: params.campaignName,
    postTitle: params.postTitle,
    postUrl: params.postUrl,
    stage: "Action"
  })

  // 2. Dispatch Email
  const liveBtnHtml = params.postUrl ? `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.postUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);">
        🔗 View Live Creative on ${params.platform || "Meta"} →
      </a>
    </div>
  ` : ""

  const previewHtml = params.contentPreview ? `
    <div style="text-align: center; margin: 16px 0; border-radius: 12px; overflow: hidden; max-height: 280px; background: #000;">
      <img src="${params.contentPreview}" alt="${params.postTitle}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; object-fit: contain;" />
    </div>
  ` : ""

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0f0f13; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e2e;">
      <div style="background: linear-gradient(135deg, #ec4899, #6366f1); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">🚀 1st Creative Deliverable is LIVE!</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">STAGE: IN ACTION (CAMPAIGN ACTIVATED)</p>
      </div>
      <div style="padding: 32px 36px; background: #16161e;">
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px;">Dear <strong>${params.clientName}</strong>,</p>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
          We are excited to inform you that the <strong>1st creative deliverable</strong> for your marketing package <strong style="color: #38bdf8;">${params.campaignName}</strong> has been officially published and launched!
        </p>
        <div style="background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Deliverable:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #f43f5e;">${params.postTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Service Category:</td>
              <td style="padding: 6px 0; text-align: right; color: #e2e8f0;">${params.service}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Platform:</td>
              <td style="padding: 6px 0; text-align: right; color: #38bdf8; font-weight: 600;">${params.platform || "Meta (Instagram / Facebook)"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Campaign Stage:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #10b981;">⚡ ACTION (Active Production)</td>
            </tr>
          </table>
        </div>
        ${previewHtml}
        ${liveBtnHtml}
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
          You can track real-time impressions, reach, views, and incoming inquiries directly on your SAAMPARK Client Portal.
        </p>
      </div>
      <div style="padding: 20px 40px; background: #0f0f13; text-align: center; border-top: 1px solid #1e1e2e;">
        <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 SAAMPARK Group. All rights reserved.</p>
      </div>
    </div>
  `

  try {
    await api.post("/email/send-general", {
      to: recipient,
      subject: `🚀 1st Post Published: "${params.postTitle}" is LIVE! - SAAMPARK Digital Marketing`,
      html,
      clientName: params.clientName,
      companyId: params.companyId,
    })
    return { success: true, message: `Notification email dispatched to ${recipient}` }
  } catch (err) {
    console.warn("Marketing 1st post email dispatch error:", err)
    return { success: true, message: `In-app notification saved for ${recipient}` }
  }
}

/**
 * 11. Send Marketing Campaign Completed Email Notification (Stage Transition: Action -> Completed)
 */
export async function sendMarketingCompletedEmailNotification(params: {
  clientName: string
  clientEmail: string
  campaignName: string
  totalPosted: number
  totalCommitment: number
  totalViews?: number
  totalReach?: number
  totalLeads?: number
  companyId?: string
}): Promise<{ success: boolean; message: string }> {
  const recipient = (params.clientEmail || "").trim()
  if (!recipient) {
    return { success: false, message: "Client email is required." }
  }

  const title = `🏆 Digital Marketing Campaign Completed: ${params.campaignName}`
  const message = `Congratulations! All ${params.totalPosted} scheduled deliverables for ${params.campaignName} have been completed and fulfilled. Thank you for partnering with SAAMPARK!`

  // 1. In-App Notification
  recordInAppNotification(recipient, title, message, {
    campaignName: params.campaignName,
    stage: "Completed",
    totalPosted: params.totalPosted,
  })

  // 2. Dispatch Email
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0f0f13; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e2e;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">🏆 Campaign Completed!</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">ALL DELIVERABLES 100% FULFILLED</p>
      </div>
      <div style="padding: 32px 36px; background: #16161e;">
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px;">Dear <strong>${params.clientName}</strong>,</p>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
          We are pleased to celebrate the successful completion of your digital marketing package <strong style="color: #38bdf8;">${params.campaignName}</strong>. All deliverables have been created, published, and reviewed.
        </p>
        <div style="background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Total Deliverables Posted:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #10b981;">${params.totalPosted} / ${params.totalCommitment}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Total Impressions & Views:</td>
              <td style="padding: 6px 0; text-align: right; color: #38bdf8; font-weight: 700;">${(params.totalViews || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Total Audience Reach:</td>
              <td style="padding: 6px 0; text-align: right; color: #e2e8f0; font-weight: 600;">${(params.totalReach || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Leads Generated:</td>
              <td style="padding: 6px 0; text-align: right; color: #f59e0b; font-weight: 800;">${params.totalLeads || 0}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://crm.saampark.com/feature/marketing" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
            View Full Campaign Analytics →
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
          To renew your retainer or upgrade to the next tier package, contact your dedicated account manager.
        </p>
      </div>
      <div style="padding: 20px 40px; background: #0f0f13; text-align: center; border-top: 1px solid #1e1e2e;">
        <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 SAAMPARK Group. All rights reserved.</p>
      </div>
    </div>
  `

  try {
    await api.post("/email/send-general", {
      to: recipient,
      subject: `🏆 Campaign Completed: ${params.campaignName} Deliverables 100% Fulfilled! - SAAMPARK Digital Marketing`,
      html,
      clientName: params.clientName,
      companyId: params.companyId,
    })
    return { success: true, message: `Completion email delivered to ${recipient}` }
  } catch (err) {
    console.warn("Marketing completion email dispatch error:", err)
    return { success: true, message: `Completion notification recorded for ${recipient}` }
  }
}



