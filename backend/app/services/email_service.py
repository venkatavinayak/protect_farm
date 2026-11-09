import aiosmtplib
from email.message import EmailMessage
import logging
from typing import List
from app.core.config import settings
from app.schemas.threat import MitigationStep

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_threat_alert_email(
        farmer_email: str,
        farmer_name: str,
        farm_name: str,
        crop_name: str,
        threat_level: str,
        threat_type: str,
        rainfall_mm: float,
        wind_kmh: float,
        explanation: str,
        mitigation_steps: List[MitigationStep]
    ) -> bool:
        """
        Asynchronously sends an emergency weather advisory email to the farmer.
        """
        steps_html = "".join([
            f"""
            <div style="background: #f8fafc; border-left: 4px solid #16a34a; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
                <strong style="color: #0f172a;">Step {s.step_number} ({s.timing_window}): {s.action_title}</strong>
                <p style="margin: 4px 0 0; color: #475569; font-size: 14px;">{s.action_description}</p>
            </div>
            """
            for s in mitigation_steps
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>PROTECTFARM Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: #15803d; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🌾 PROTECTFARM Emergency Weather Alert</h1>
                    <p style="margin: 5px 0 0; font-size: 14px;">Real-Time Agricultural Threat Advisory</p>
                </div>
                
                <div style="padding: 24px;">
                    <p style="font-size: 16px; color: #1e293b;">Dear <strong>{farmer_name}</strong>,</p>
                    <p style="font-size: 14px; color: #475569;">
                        Our geospatial micro-climate sensors have detected a threat for your farm <strong>{farm_name}</strong>.
                    </p>

                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 16px 0;">
                        <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                            STATUS: {threat_level}
                        </span>
                        <h3 style="color: #991b1b; margin: 10px 0 6px;">Affected Crop: {crop_name} ({threat_type})</h3>
                        <p style="margin: 0; color: #7f1d1d; font-size: 13px;">
                            Forecast Rainfall: <strong>{rainfall_mm} mm</strong> | Max Wind Gusts: <strong>{wind_kmh} km/h</strong>
                        </p>
                    </div>

                    <h4 style="color: #0f172a; margin-bottom: 8px;">🔬 Agronomic Explanation (Why this hurts your crop):</h4>
                    <p style="color: #334155; font-size: 14px; line-height: 1.5; background: #f8fafc; padding: 12px; border-radius: 6px;">
                        {explanation}
                    </p>

                    <h4 style="color: #0f172a; margin: 20px 0 10px;">📋 Actionable Mitigation Steps:</h4>
                    {steps_html}

                    <div style="text-align: center; margin-top: 25px;">
                        <a href="https://protectfarm.netlify.app/advisory" style="background: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Open Voice Assistant on Web
                        </a>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 12px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
                    PROTECTFARM • Protecting farmer livelihoods through real-time AI & geospatial intelligence.
                </div>
            </div>
        </body>
        </html>
        """

        # In dev or if credentials are empty, log preview cleanly
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(f"📧 [DEV MOCK EMAIL] Alert sent to {farmer_email} for {crop_name} (Level: {threat_level})")
            return True

        message = EmailMessage()
        message["From"] = settings.EMAIL_FROM
        message["To"] = farmer_email
        message["Subject"] = f"🚨 Agricultural Threat Alert: {threat_level} for {crop_name} at {farm_name}"
        message.set_content("Please enable HTML to view this agricultural advisory.")
        message.add_alternative(html_content, subtype="html")

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {farmer_email}: {e}")
            return False
