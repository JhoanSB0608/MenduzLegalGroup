const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const fs = require('fs').promises;
const path = require('path');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// Helper function to send verification email using Resend
const sendVerificationEmail = async (user) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const imageUrl = `https://i.postimg.cc/MKw348dD/logo-Principal.png`;
  const verificationLink = `${backendUrl}/api/users/verify/${user.verificationToken}`;

  const mailOptions = {
    from: "MenduzLegalGroup <no-reply@menduz.com.co>",
    to: user.email,
    subject: 'Verifica tu correo electrónico - MenduzLegalGroup',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0B0F1A; background-image: linear-gradient(135deg, #0F172A 0%, #1E40AF 100%); min-height: 100vh;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <!-- Contenedor principal con efecto glassmorphism premium -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: rgba(22, 27, 34, 0.9); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.5); overflow: hidden;">
                
                <!-- Header con logo y acento dorado -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px; border-bottom: 2px solid #D97706;">
                    <img src="${imageUrl}" alt="MenduzLegalGroup Logo" title="MenduzLegalGroup Logo" style="max-width: 180px; height: auto; display: block; margin: 0 auto; font-family: sans-serif; color: #ffffff; font-size: 16px; font-weight: bold;" />
                  </td>
                </tr>
                
                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Título -->
                    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 800; color: #ffffff; text-align: center; letter-spacing: -0.02em;">
                      ¡Bienvenido a MenduzLegalGroup!
                    </h1>
                    
                    <!-- Saludo -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #ffffff; text-align: center;">
                      Hola <strong style="color: #D97706;">${user.name}</strong>,
                    </p>
                    
                    <!-- Mensaje principal -->
                    <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.7; color: #94A3B8; text-align: center;">
                      Gracias por registrarte en nuestra plataforma. Para activar tu cuenta corporativa y acceder a todas las funcionalidades, confirma tu dirección de correo electrónico a continuación.
                    </p>
                    
                    <!-- Botón de verificación Premium -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: linear-gradient(135deg, #1E40AF 0%, #0F172A 100%); border-radius: 12px; box-shadow: 0 8px 24px 0 rgba(30, 64, 175, 0.4);">
                                <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 18px 54px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                                  Verificar mi cuenta
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info adicional -->
                    <div style="margin: 30px 0 0 0; padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #F59E0B; text-align: center;">
                        ⏱️ <strong>Este enlace expirará en 1 hora</strong>
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94A3B8; text-align: center;">
                        Por razones de seguridad institucional, te recomendamos completar este paso de inmediato.
                      </p>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer Corporativo -->
                <tr>
                  <td style="padding: 30px 40px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.6; color: #64748B; text-align: center;">
                      Si no has solicitado este registro, puedes descartar este mensaje de forma segura.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #475569; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      © ${new Date().getFullYear()} MenduzLegalGroup. Servicios Jurídicos Enterprise.
                    </p>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };

  try {
    await resend.emails.send(mailOptions);
  } catch (error) {
    console.error(`Failed to send verification email to ${user.email}`, error);
    throw error;
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if user is verified
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, complete todos los campos' });
    }

    // Use a simple regex that doesn't allow spaces
    const emailRegex = /^\S+@\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Por favor, ingrese un correo electrónico válido (sin espacios)' });
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // 3. Create user instance (in memory)
    const user = new User({
      name,
      email,
      password,
      isAdmin: true, // All new users are admins as per request
      isVerified: false,
    });

    // 4. Generate token
    user.generateVerificationToken();

    // 5. Send verification email FIRST
    await sendVerificationEmail(user);

    // 6. If email is sent successfully, THEN save the user
    await user.save();
  
    // 7. Send success response
    res.status(201).json({
      message: 'Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ message: 'Error de conexión al enviar el correo de verificación. Por favor, revise la configuración del servidor de correo y vuelva a intentarlo.' });
    }
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
  }
};

// @desc    Verify user email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log('Received verification token:', token);

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    console.log('User found by token:', user ? user.email : 'None');
    console.log('Current time:', new Date(Date.now()));

    if (!user) {
      console.log('Verification failed: User not found or token expired.');
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=Token inválido o expirado.`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success`);
  } catch (error) {
    console.error('Error al verificar correo electrónico:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=Error interno del servidor.`);
  }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({ message: 'Si existe una cuenta con este correo, se ha enviado un nuevo enlace de verificación.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Esta cuenta ya ha sido verificada.' });
    }

    // Regenerate token and send email
    user.generateVerificationToken();
    await sendVerificationEmail(user);
    await user.save();

    res.status(200).json({ message: 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico.' });

  } catch (error) {
    console.error('Error al reenviar el correo de verificación:', error);
    res.status(500).json({ message: 'Ha ocurrido un error interno al intentar reenviar el correo.' });
  }
};

module.exports = { authUser, registerUser, verifyEmail, resendVerificationEmail };
