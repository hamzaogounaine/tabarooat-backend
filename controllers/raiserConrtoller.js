const Raiser = require("../models/Raiser");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const registerFundraiser = async (req, res) => {
    try {
        const { 
            email, 
            firstName, 
            lastName, 
            password, 
            phoneNumber, 
            dateOfBirth,
            nationalId,
            address,
            termsAccepted,
            privacyPolicyAccepted
        } = req.body;

        // Validation
        if (!email || !firstName || !lastName || !password || !phoneNumber || !dateOfBirth || !nationalId) {
            return res.status(400).json({ message: 'جميع الحقول الأساسية مطلوبة' });
        }

        if (!address || !address.street || !address.city || !address.state || !address.country || !address.postalCode) {
            return res.status(400).json({ message: 'عنوان كامل مطلوب' });
        }


        if (!termsAccepted || !privacyPolicyAccepted) {
            return res.status(400).json({ message: 'يجب الموافقة على الشروط والأحكام وسياسة الخصوصية' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'كلمة السر يجب أن تكون 6 حروف على الأقل' });
        }

        // Check age (must be 18+)
        const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
        if (age < 18) {
            return res.status(400).json({ message: 'يجب أن يكون العمر 18 سنة أو أكثر' });
        }

        // Check if email already exists
        const existingUser = await Raiser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'هذا الإيميل مسجل من قبل' });
        }

        // Check if national ID already exists
        const existingNationalId = await Raiser.findOne({ nationalId });
        if (existingNationalId) {
            return res.status(409).json({ message: 'هذا الرقم الوطني مسجل من قبل' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create fundraiser user
        const fundRaiser = new Raiser({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            phoneNumber,
            dateOfBirth,
            nationalId,
            address,
            termsAccepted,
            privacyPolicyAccepted,
            termsAcceptedDate: new Date(),
            emailVerificationToken,
            emailVerificationExpires,
            accountStatus: 'pending_approval' // Requires admin approval
        });

        await fundRaiser.save();

        // TODO: Send email verification email
        // await sendEmailVerification(email, emailVerificationToken);

        return res.status(201).json({ 
            message: 'تم التسجيل بنجاح. سيتم مراجعة طلبك خلال 24-48 ساعة',
            userId: fundRaiser._id
        });

    } catch (error) {
        console.error('Fundraiser registration error:', error);
        return res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};


const loginFundraiser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'البريد الإلكتروني وكلمة السر مطلوبان' });
        }

        // Find fundraiser user
        const fundraiserUser = await Raiser.findOne({ email });
        if (!fundraiserUser) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة السر غير صحيحة' });
        }

        // Check if account is locked
        if (fundraiserUser.isLocked) {
            return res.status(423).json({ message: 'الحساب مقفل مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة' });
        }

        // Check account status
        if (fundraiserUser.accountStatus === 'pending_approval') {
            return res.status(403).json({ message: 'حسابك قيد المراجعة. سيتم إشعارك عند الموافقة' });
        }

        if (fundraiserUser.accountStatus === 'suspended') {
            return res.status(403).json({ message: 'حسابك معلق. تواصل مع الدعم الفني' });
        }

        if (fundraiserUser.accountStatus === 'banned') {
            return res.status(403).json({ message: 'حسابك محظور' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, fundraiserUser.password);
        if (!validPassword) {
            await fundraiserUser.incLoginAttempts();
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة السر غير صحيحة' });
        }

        // Reset login attempts on successful login
        if (fundraiserUser.loginAttempts > 0) {
            await fundraiserUser.resetLoginAttempts();
        }

        // Update last login
        fundraiserUser.lastLogin = new Date();
        await fundraiserUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: fundraiserUser._id, 
                email: fundraiserUser.email,
                userType: 'fundraiser',
                isVerified: fundraiserUser.isVerified
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            user: {
                id: fundraiserUser._id,
                email: fundraiserUser.email,
                firstName: fundraiserUser.firstName,
                lastName: fundraiserUser.lastName,
                isVerified: fundraiserUser.isVerified,
                accountStatus: fundraiserUser.accountStatus,
                isEmailVerified: fundraiserUser.isEmailVerified,
                profileImage: fundraiserUser.profileImage
            }
        });

    } catch (error) {
        console.error('Fundraiser login error:', error);
        return res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};



module.exports = {loginFundraiser , registerFundraiser}