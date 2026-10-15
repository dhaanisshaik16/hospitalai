/**
 * Smart Hospital Appointment System (SHAS) - Seed Data Module
 * Generates rich, realistic synthetic data for 8 departments, 12 doctors,
 * 30 patients, pre-configured appointments, active waitlist queues,
 * and demo scenarios anchored relative to the current local date.
 */

window.SHAS = window.SHAS || {};

window.SHAS.SeedData = (function () {
  'use strict';

  function generateSeedData() {
    const Utils = window.SHAS.Utils;
    const today = Utils.getTodayDateString();
    const tomorrow = Utils.addDays(today, 1);
    const dayAfter = Utils.addDays(today, 2);
    const day3 = Utils.addDays(today, 3);
    const day4 = Utils.addDays(today, 4);
    const yesterday = Utils.addDays(today, -1);
    const twoDaysAgo = Utils.addDays(today, -2);

    // 8 Specialized Hospital Departments
    const departments = [
      {
        id: 'dept-gen-med',
        name: 'General Medicine',
        description: 'Comprehensive adult health, preventative care, and chronic disease management.',
        icon: 'Stethoscope',
        color: '#2563eb',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-cardio',
        name: 'Cardiology',
        description: 'Cardiovascular assessment, heart disease intervention, and coronary health.',
        icon: 'HeartPulse',
        color: '#dc2626',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-derma',
        name: 'Dermatology',
        description: 'Skin health diagnostics, cutaneous surgery, and cosmetic dermatological care.',
        icon: 'Sparkles',
        color: '#d97706',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-pedia',
        name: 'Pediatrics',
        description: 'Dedicated healthcare for infants, children, and adolescents up to 18 years.',
        icon: 'Baby',
        color: '#059669',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-ortho',
        name: 'Orthopedics',
        description: 'Musculoskeletal medicine, joint reconstruction, sports injury rehabilitation.',
        icon: 'Bone',
        color: '#7c3aed',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-neuro',
        name: 'Neurology',
        description: 'Disorders of the brain, spinal cord, and peripheral nervous system.',
        icon: 'Brain',
        color: '#4f46e5',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-gyne',
        name: 'Gynecology & Obstetrics',
        description: 'Womens reproductive health, prenatal guidance, and maternal-fetal care.',
        icon: 'Flower2',
        color: '#db2777',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'dept-ent',
        name: 'Ear, Nose & Throat (ENT)',
        description: 'Diagnosis and surgical treatment of otolaryngological and sinus conditions.',
        icon: 'Activity',
        color: '#0891b2',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ];

    // 12 Highly-Qualified Doctors with Working Hours, Breaks, and Consultation Durations
    const doctors = [
      {
        id: 'doc-cardio-1',
        name: 'Dr. Marcus Chen',
        title: 'Senior Interventional Cardiologist',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        qualification: 'MD, FACC, FSCAI (Harvard Medical)',
        experienceYears: 16,
        consultationFee: 120,
        consultationDuration: 30, // 30 minutes
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
        leaves: [],
        rating: 4.9,
        reviewsCount: 142,
        active: true,
        bio: 'Dr. Marcus Chen has over 16 years of leadership in cardiac catheterization and coronary preventative care.'
      },
      {
        id: 'doc-cardio-2',
        name: 'Dr. Elena Rostova',
        title: 'Consultant Cardiologist & Electrophysiologist',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        qualification: 'MD, PhD, FESC (Johns Hopkins)',
        experienceYears: 12,
        consultationFee: 140,
        consultationDuration: 30,
        avatar: 'https://images.unsplash.com/photo-1594824813633-898705b4b122?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '12:30', end: '13:30' }],
        leaves: [],
        rating: 4.8,
        reviewsCount: 98,
        active: true,
        bio: 'Specialist in arrhythmia management, pacemaker implantation, and cardiac ultrasound diagnostics.'
      },
      {
        id: 'doc-gen-1',
        name: 'Dr. Sarah Lin',
        title: 'Chief Medical Officer & Primary Care Physician',
        departmentId: 'dept-gen-med',
        departmentName: 'General Medicine',
        qualification: 'MD, FACP (Columbia University)',
        experienceYears: 18,
        consultationFee: 85,
        consultationDuration: 20, // 20 minutes
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '08:30', end: '16:30' },
        breaks: [{ name: 'Lunch Break', start: '12:30', end: '13:30' }],
        leaves: [],
        rating: 4.95,
        reviewsCount: 220,
        active: true,
        bio: 'Dedicated internal medicine practitioner focusing on holistic adult wellness and complex diagnostic cases.'
      },
      {
        id: 'doc-gen-2',
        name: 'Dr. James Wilson',
        title: 'Internal Medicine Specialist',
        departmentId: 'dept-gen-med',
        departmentName: 'General Medicine',
        qualification: 'MD, MRCPI (Oxford University)',
        experienceYears: 9,
        consultationFee: 75,
        consultationDuration: 20,
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
        leaves: [],
        rating: 4.7,
        reviewsCount: 84,
        active: true,
        bio: 'Expert in lifestyle medicine, hypertension management, and preventative health screenings.'
      },
      {
        id: 'doc-derma-1',
        name: 'Dr. David Kim',
        title: 'Board Certified Dermatologist',
        departmentId: 'dept-derma',
        departmentName: 'Dermatology',
        qualification: 'MD, FAAD (Stanford Medicine)',
        experienceYears: 11,
        consultationFee: 110,
        consultationDuration: 20,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '16:00' },
        breaks: [{ name: 'Lunch Break', start: '12:00', end: '13:00' }],
        leaves: [],
        rating: 4.85,
        reviewsCount: 115,
        active: true,
        bio: 'Specialist in dermatologic oncology, laser therapies, and complex inflammatory skin conditions.'
      },
      {
        id: 'doc-pedia-1',
        name: 'Dr. Maya Patel',
        title: 'Director of Pediatric Medicine',
        departmentId: 'dept-pedia',
        departmentName: 'Pediatrics',
        qualification: 'MD, FAAP (Yale School of Medicine)',
        experienceYears: 14,
        consultationFee: 90,
        consultationDuration: 20,
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '08:30', end: '16:30' },
        breaks: [{ name: 'Lunch Break', start: '12:30', end: '13:30' }],
        leaves: [],
        rating: 4.96,
        reviewsCount: 195,
        active: true,
        bio: 'Compassionate pediatric care focusing on newborn development, childhood immunology, and adolescent health.'
      },
      {
        id: 'doc-pedia-2',
        name: 'Dr. Olivia Bennett',
        title: 'Pediatric Specialist',
        departmentId: 'dept-pedia',
        departmentName: 'Pediatrics',
        qualification: 'MD, DCH (UCLA David Geffen)',
        experienceYears: 7,
        consultationFee: 80,
        consultationDuration: 20,
        avatar: 'https://images.unsplash.com/photo-1559839734-6c71c4c11929?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
        leaves: [],
        rating: 4.75,
        reviewsCount: 64,
        active: true,
        bio: 'Passionate about family-centered pediatric medicine, childhood asthma, and preventive wellness.'
      },
      {
        id: 'doc-ortho-1',
        name: 'Dr. Rachel Adams',
        title: 'Orthopedic Surgeon & Joint Specialist',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopedics',
        qualification: 'MD, FAAOS (Mayo Clinic)',
        experienceYears: 15,
        consultationFee: 135,
        consultationDuration: 30,
        avatar: 'https://images.unsplash.com/photo-1594824813714-41d40a2c04e2?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '16:00' },
        breaks: [{ name: 'Lunch Break', start: '12:30', end: '13:30' }],
        leaves: [],
        rating: 4.9,
        reviewsCount: 130,
        active: true,
        bio: 'Pioneering minimally invasive hip and knee replacements and advanced arthroscopic reconstructions.'
      },
      {
        id: 'doc-ortho-2',
        name: 'Dr. Anthony Ross',
        title: 'Sports Medicine & Trauma Surgeon',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopedics',
        qualification: 'MD, FRCSC (McGill University)',
        experienceYears: 10,
        consultationFee: 125,
        consultationDuration: 30,
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '08:30', end: '16:30' },
        breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
        leaves: [],
        rating: 4.82,
        reviewsCount: 88,
        active: true,
        bio: 'Specialist in athletic ligament reconstructions, shoulder instability, and acute orthopedic trauma.'
      },
      {
        id: 'doc-neuro-1',
        name: 'Dr. Vikram Mehta',
        title: 'Senior Consultant Neurologist',
        departmentId: 'dept-neuro',
        departmentName: 'Neurology',
        qualification: 'MD, DM, FAAN (Cambridge & AIIMS)',
        experienceYears: 17,
        consultationFee: 150,
        consultationDuration: 30,
        avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:30', end: '17:30' },
        breaks: [{ name: 'Lunch Break', start: '13:30', end: '14:30' }],
        leaves: [],
        rating: 4.94,
        reviewsCount: 160,
        active: true,
        bio: 'Recognized authority on migraine management, stroke prevention, Parkinson disease, and neurophysiology.'
      },
      {
        id: 'doc-gyne-1',
        name: 'Dr. Sophia Martinez',
        title: 'Consultant Obstetrician & Gynecologist',
        departmentId: 'dept-gyne',
        departmentName: 'Gynecology & Obstetrics',
        qualification: 'MD, FACOG (Penn Medicine)',
        experienceYears: 13,
        consultationFee: 115,
        consultationDuration: 30,
        avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
        leaves: [],
        rating: 4.88,
        reviewsCount: 145,
        active: true,
        bio: 'Comprehensive prenatal management, minimally invasive gynecologic surgery, and reproductive health counseling.'
      },
      {
        id: 'doc-ent-1',
        name: 'Dr. Michael Thorne',
        title: 'Otolaryngologist & Head/Neck Surgeon',
        departmentId: 'dept-ent',
        departmentName: 'Ear, Nose & Throat (ENT)',
        qualification: 'MS (ENT), FRCS (Royal College of Surgeons)',
        experienceYears: 9,
        consultationFee: 90,
        consultationDuration: 20,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        workingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '09:00', end: '17:00' },
        breaks: [{ name: 'Lunch Break', start: '12:30', end: '13:30' }],
        leaves: [],
        rating: 4.79,
        reviewsCount: 72,
        active: true,
        bio: 'Specialist in endoscopic sinus surgery, sleep apnea treatment, vertigo, and pediatric ear infections.'
      }
    ];

    // 30 Synthetic Patients with Comprehensive Profile Attributes
    const patients = [
      {
        id: 'pat-1',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        gender: 'Female',
        dob: '1989-04-12',
        bloodGroup: 'A+',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: 'Mark Jenkins (Spouse) - +1 (555) 234-5679',
        medicalNotes: 'Mild asthma, penicillin allergy.'
      },
      {
        id: 'pat-2',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 345-6789',
        gender: 'Male',
        dob: '1982-11-23',
        bloodGroup: 'O+',
        address: '104 Beacon St, Boston',
        emergencyContact: 'Diana Vance (Sister) - +1 (555) 345-6780',
        medicalNotes: 'Borderline hypertension.'
      },
      {
        id: 'pat-3',
        name: 'Emily Watson',
        email: 'emily.watson@example.com',
        phone: '+1 (555) 456-7890',
        gender: 'Female',
        dob: '1995-08-30',
        bloodGroup: 'B+',
        address: '221B Baker Way, Cityview',
        emergencyContact: 'John Watson (Father) - +1 (555) 456-7891',
        medicalNotes: 'No known chronic conditions.'
      },
      {
        id: 'pat-4',
        name: 'Liam Cooper',
        email: 'liam.cooper@example.com',
        phone: '+1 (555) 567-8901',
        gender: 'Male',
        dob: '1976-03-15',
        bloodGroup: 'AB+',
        address: '88 Maple Ave, Greenfield',
        emergencyContact: 'Claire Cooper (Spouse) - +1 (555) 567-8902',
        medicalNotes: 'Annual cardiac checkup.'
      },
      {
        id: 'pat-5',
        name: 'Chloe Davis',
        email: 'chloe.davis@example.com',
        phone: '+1 (555) 678-9012',
        gender: 'Female',
        dob: '2016-06-20',
        bloodGroup: 'O-',
        address: '15 Oak Ridge Lane, Riverdale',
        emergencyContact: 'Rachel Davis (Mother) - +1 (555) 678-9013',
        medicalNotes: 'Peanut allergy.'
      },
      {
        id: 'pat-6',
        name: 'Alexander Scott',
        email: 'alexander.scott@example.com',
        phone: '+1 (555) 789-0123',
        gender: 'Male',
        dob: '1991-01-18',
        bloodGroup: 'A-',
        address: '42 Pine Crest, Hillside',
        emergencyContact: 'Laura Scott (Spouse) - +1 (555) 789-0124',
        medicalNotes: 'Eczema management.'
      },
      {
        id: 'pat-7',
        name: 'Sophia Green',
        email: 'sophia.green@example.com',
        phone: '+1 (555) 890-1234',
        gender: 'Female',
        dob: '1988-12-05',
        bloodGroup: 'B-',
        address: '300 River Road, Meadowview',
        emergencyContact: 'David Green (Brother) - +1 (555) 890-1235',
        medicalNotes: 'Migraine monitoring.'
      },
      {
        id: 'pat-8',
        name: 'Lucas Miller',
        email: 'lucas.miller@example.com',
        phone: '+1 (555) 901-2345',
        gender: 'Male',
        dob: '1979-07-25',
        bloodGroup: 'O+',
        address: '77 Cedar Boulevard, Brookline',
        emergencyContact: 'Grace Miller (Spouse) - +1 (555) 901-2346',
        medicalNotes: 'Hypercholesterolemia.'
      },
      {
        id: 'pat-9',
        name: 'Olivia Taylor',
        email: 'olivia.taylor@example.com',
        phone: '+1 (555) 012-3456',
        gender: 'Female',
        dob: '1993-09-14',
        bloodGroup: 'A+',
        address: '512 Elm Court, Fairview',
        emergencyContact: 'Sam Taylor (Spouse) - +1 (555) 012-3457',
        medicalNotes: 'Routine wellness.'
      },
      {
        id: 'pat-10',
        name: 'Noah White',
        email: 'noah.white@example.com',
        phone: '+1 (555) 123-4560',
        gender: 'Male',
        dob: '1985-05-19',
        bloodGroup: 'AB-',
        address: '19 Willow Way, Woodside',
        emergencyContact: 'Hannah White (Sister) - +1 (555) 123-4561',
        medicalNotes: 'Exercise induced arrhythmia review.'
      },
      {
        id: 'pat-11',
        name: 'Ava Anderson',
        email: 'ava.anderson@example.com',
        phone: '+1 (555) 234-5671',
        gender: 'Female',
        dob: '1998-02-11',
        bloodGroup: 'O+',
        address: '94 Aspen Dr, Sunnyvale',
        emergencyContact: 'Robert Anderson (Father) - +1 (555) 234-5672',
        medicalNotes: 'Iron deficiency anemia.'
      },
      {
        id: 'pat-12',
        name: 'Ethan Thomas',
        email: 'ethan.thomas@example.com',
        phone: '+1 (555) 345-6782',
        gender: 'Male',
        dob: '1990-10-08',
        bloodGroup: 'B+',
        address: '63 Birch Lane, Lakeview',
        emergencyContact: 'Jessica Thomas (Spouse) - +1 (555) 345-6783',
        medicalNotes: 'Sports clearance evaluation.'
      },
      {
        id: 'pat-13',
        name: 'Mia Jackson',
        email: 'mia.jackson@example.com',
        phone: '+1 (555) 456-7893',
        gender: 'Female',
        dob: '1984-06-17',
        bloodGroup: 'A+',
        address: '12 Magnolia Blvd, Parkside',
        emergencyContact: 'Chris Jackson (Spouse) - +1 (555) 456-7894',
        medicalNotes: 'Thyroid hormone evaluation.'
      },
      {
        id: 'pat-14',
        name: 'Benjamin Harris',
        email: 'ben.harris@example.com',
        phone: '+1 (555) 567-8904',
        gender: 'Male',
        dob: '1974-12-22',
        bloodGroup: 'O+',
        address: '401 Cypress St, Downtown',
        emergencyContact: 'Lisa Harris (Spouse) - +1 (555) 567-8905',
        medicalNotes: 'Post-stent coronary follow-up.'
      },
      {
        id: 'pat-15',
        name: 'Isabella Martin',
        email: 'isabella.martin@example.com',
        phone: '+1 (555) 678-9015',
        gender: 'Female',
        dob: '1996-03-04',
        bloodGroup: 'AB+',
        address: '82 Sycamore Ave, Highland',
        emergencyContact: 'Victor Martin (Father) - +1 (555) 678-9016',
        medicalNotes: 'Mitral valve prolapse check.'
      },
      {
        id: 'pat-16',
        name: 'James Clark',
        email: 'james.clark@example.com',
        phone: '+1 (555) 789-0126',
        gender: 'Male',
        dob: '1981-04-29',
        bloodGroup: 'A-',
        address: '55 Chestnut St, West End',
        emergencyContact: 'Megan Clark (Spouse) - +1 (555) 789-0127',
        medicalNotes: 'Stress test follow-up.'
      },
      {
        id: 'pat-17',
        name: 'Charlotte Lewis',
        email: 'charlotte.lewis@example.com',
        phone: '+1 (555) 890-1237',
        gender: 'Female',
        dob: '1992-07-16',
        bloodGroup: 'O+',
        address: '730 Walnut Dr, Northfield',
        emergencyContact: 'Paul Lewis (Brother) - +1 (555) 890-1238',
        medicalNotes: 'Family history of cardiomyopathy.'
      },
      {
        id: 'pat-18',
        name: 'Henry Walker',
        email: 'henry.walker@example.com',
        phone: '+1 (555) 901-2348',
        gender: 'Male',
        dob: '1968-08-11',
        bloodGroup: 'B+',
        address: '11 Poplar Court, Eastside',
        emergencyContact: 'Ruth Walker (Spouse) - +1 (555) 901-2349',
        medicalNotes: 'Hypertension and prediabetes.'
      },
      {
        id: 'pat-19',
        name: 'Amelia Young',
        email: 'amelia.young@example.com',
        phone: '+1 (555) 012-3459',
        gender: 'Female',
        dob: '1994-11-09',
        bloodGroup: 'A+',
        address: '28 Orchard Way, Valley',
        emergencyContact: 'Lucas Young (Brother) - +1 (555) 012-3460',
        medicalNotes: 'Allergic rhinitis.'
      },
      {
        id: 'pat-20',
        name: 'Daniel King',
        email: 'daniel.king@example.com',
        phone: '+1 (555) 123-4570',
        gender: 'Male',
        dob: '1987-01-30',
        bloodGroup: 'O-',
        address: '614 Harbor Rd, Seaport',
        emergencyContact: 'Helen King (Mother) - +1 (555) 123-4571',
        medicalNotes: 'Knee injury rehabilitation.'
      },
      {
        id: 'pat-21',
        name: 'Harper Wright',
        email: 'harper.wright@example.com',
        phone: '+1 (555) 234-5681',
        gender: 'Female',
        dob: '1999-05-24',
        bloodGroup: 'B-',
        address: '108 Summit Ave, Crestview',
        emergencyContact: 'Gary Wright (Father) - +1 (555) 234-5682',
        medicalNotes: 'Dermatitis consultation.'
      },
      {
        id: 'pat-22',
        name: 'Matthew Lopez',
        email: 'matthew.lopez@example.com',
        phone: '+1 (555) 345-6792',
        gender: 'Male',
        dob: '1980-09-18',
        bloodGroup: 'A+',
        address: '350 Sunset Blvd, Golden Hills',
        emergencyContact: 'Maria Lopez (Spouse) - +1 (555) 345-6793',
        medicalNotes: 'Lower back stiffness.'
      },
      {
        id: 'pat-23',
        name: 'Evelyn Hill',
        email: 'evelyn.hill@example.com',
        phone: '+1 (555) 456-7803',
        gender: 'Female',
        dob: '1986-07-02',
        bloodGroup: 'AB-',
        address: '47 Garden St, Rosewood',
        emergencyContact: 'Patrick Hill (Spouse) - +1 (555) 456-7804',
        medicalNotes: 'Prenatal first trimester.'
      },
      {
        id: 'pat-24',
        name: 'Jackson Green',
        email: 'jackson.green@example.com',
        phone: '+1 (555) 567-8914',
        gender: 'Male',
        dob: '1973-10-14',
        bloodGroup: 'O+',
        address: '190 Forest Lane, Woodbury',
        emergencyContact: 'Teresa Green (Spouse) - +1 (555) 567-8915',
        medicalNotes: 'Sleep apnea consultation.'
      },
      {
        id: 'pat-25',
        name: 'Abigail Adams',
        email: 'abigail.adams@example.com',
        phone: '+1 (555) 678-9025',
        gender: 'Female',
        dob: '2018-09-01',
        bloodGroup: 'A+',
        address: '33 Meadowview Ct, Springdale',
        emergencyContact: 'Thomas Adams (Father) - +1 (555) 678-9026',
        medicalNotes: 'Well-child immunization check.'
      },
      {
        id: 'pat-26',
        name: 'Sebastian Baker',
        email: 'sebastian.baker@example.com',
        phone: '+1 (555) 789-0136',
        gender: 'Male',
        dob: '1997-12-03',
        bloodGroup: 'B+',
        address: '89 Beacon Hill, Old Town',
        emergencyContact: 'Nancy Baker (Mother) - +1 (555) 789-0137',
        medicalNotes: 'Sinus pressure.'
      },
      {
        id: 'pat-27',
        name: 'Ella Gonzalez',
        email: 'ella.gonzalez@example.com',
        phone: '+1 (555) 890-1247',
        gender: 'Female',
        dob: '1990-03-27',
        bloodGroup: 'O-',
        address: '502 Riverwalk Way, Bayside',
        emergencyContact: 'Carlos Gonzalez (Spouse) - +1 (555) 890-1248',
        medicalNotes: 'Dermatological screening.'
      },
      {
        id: 'pat-28',
        name: 'Logan Nelson',
        email: 'logan.nelson@example.com',
        phone: '+1 (555) 901-2358',
        gender: 'Male',
        dob: '1983-08-21',
        bloodGroup: 'A-',
        address: '77 Heritage Dr, Colonial',
        emergencyContact: 'Karen Nelson (Spouse) - +1 (555) 901-2359',
        medicalNotes: 'General wellness check.'
      },
      {
        id: 'pat-29',
        name: 'Aria Carter',
        email: 'aria.carter@example.com',
        phone: '+1 (555) 012-3469',
        gender: 'Female',
        dob: '1995-04-06',
        bloodGroup: 'AB+',
        address: '215 Marina Blvd, Pier district',
        emergencyContact: 'Kyle Carter (Brother) - +1 (555) 012-3470',
        medicalNotes: 'Occasional migraines.'
      },
      {
        id: 'pat-30',
        name: 'Jack Mitchell',
        email: 'jack.mitchell@example.com',
        phone: '+1 (555) 123-4580',
        gender: 'Male',
        dob: '1978-06-12',
        bloodGroup: 'O+',
        address: '633 Ridge Rd, Pinewood',
        emergencyContact: 'Andrea Mitchell (Spouse) - +1 (555) 123-4581',
        medicalNotes: 'Tendonitis right elbow.'
      }
    ];

    // Seed Appointments:
    // IMPORTANT HACKATHON DEMO SCENARIO:
    // Dr. Marcus Chen (Cardiology) is completely booked tomorrow!
    // Specifically, Emily Watson (pat-3) has an appointment at 10:00 AM.
    // When cancelled, it directly triggers waitlist allocation for Sarah Jenkins (pat-1)!
    const appointments = [
      // Tomorrow's fully-booked schedule for Dr. Marcus Chen (doc-cardio-1)
      {
        id: 'apt-demo-chen-1',
        bookingRef: 'SHAS-2026-CH01',
        patientId: 'pat-4',
        patientName: 'Liam Cooper',
        patientEmail: 'liam.cooper@example.com',
        patientPhone: '+1 (555) 567-8901',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '09:00',
        endTime: '09:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Annual coronary follow-up.',
        createdAt: '2026-10-10T10:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-2',
        bookingRef: 'SHAS-2026-CH02',
        patientId: 'pat-7',
        patientName: 'Sophia Green',
        patientEmail: 'sophia.green@example.com',
        patientPhone: '+1 (555) 890-1234',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '09:30',
        endTime: '10:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Cardiac echo review.',
        createdAt: '2026-10-10T11:00:00.000Z'
      },
      {
        // THIS IS THE PRIMARY DEMO APPOINTMENT TO CANCEL
        id: 'apt-demo-chen-3',
        bookingRef: 'SHAS-2026-DEMO',
        patientId: 'pat-3',
        patientName: 'Emily Watson',
        patientEmail: 'emily.watson@example.com',
        patientPhone: '+1 (555) 456-7890',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '10:00',
        endTime: '10:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: '★ PRIME DEMO APPOINTMENT: Cancel this appointment to demonstrate instant automatic waitlist allocation to Sarah Jenkins (Queue #1)!',
        createdAt: '2026-10-10T12:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-4',
        bookingRef: 'SHAS-2026-CH04',
        patientId: 'pat-8',
        patientName: 'Lucas Miller',
        patientEmail: 'lucas.miller@example.com',
        patientPhone: '+1 (555) 901-2345',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '10:30',
        endTime: '11:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Hypercholesterolemia management.',
        createdAt: '2026-10-10T13:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-5',
        bookingRef: 'SHAS-2026-CH05',
        patientId: 'pat-9',
        patientName: 'Olivia Taylor',
        patientEmail: 'olivia.taylor@example.com',
        patientPhone: '+1 (555) 012-3456',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '11:00',
        endTime: '11:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Pre-surgery cardiac clearance.',
        createdAt: '2026-10-10T14:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-6',
        bookingRef: 'SHAS-2026-CH06',
        patientId: 'pat-10',
        patientName: 'Noah White',
        patientEmail: 'noah.white@example.com',
        patientPhone: '+1 (555) 123-4560',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '11:30',
        endTime: '12:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Holter monitor report discussion.',
        createdAt: '2026-10-10T15:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-7',
        bookingRef: 'SHAS-2026-CH07',
        patientId: 'pat-11',
        patientName: 'Ava Anderson',
        patientEmail: 'ava.anderson@example.com',
        patientPhone: '+1 (555) 234-5671',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '12:00',
        endTime: '12:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Blood pressure spike inquiry.',
        createdAt: '2026-10-10T16:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-8',
        bookingRef: 'SHAS-2026-CH08',
        patientId: 'pat-12',
        patientName: 'Ethan Thomas',
        patientEmail: 'ethan.thomas@example.com',
        patientPhone: '+1 (555) 345-6782',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '12:30',
        endTime: '13:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Cardiac rehabilitation progress check.',
        createdAt: '2026-10-10T17:00:00.000Z'
      },
      // Afternoon slots for Dr. Chen tomorrow
      {
        id: 'apt-demo-chen-9',
        bookingRef: 'SHAS-2026-CH09',
        patientId: 'pat-13',
        patientName: 'Mia Jackson',
        patientEmail: 'mia.jackson@example.com',
        patientPhone: '+1 (555) 456-7893',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '14:00',
        endTime: '14:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Post-op medication adjustment.',
        createdAt: '2026-10-11T09:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-10',
        bookingRef: 'SHAS-2026-CH10',
        patientId: 'pat-14',
        patientName: 'Benjamin Harris',
        patientEmail: 'ben.harris@example.com',
        patientPhone: '+1 (555) 567-8904',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '14:30',
        endTime: '15:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Stent placement follow-up.',
        createdAt: '2026-10-11T10:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-11',
        bookingRef: 'SHAS-2026-CH11',
        patientId: 'pat-15',
        patientName: 'Isabella Martin',
        patientEmail: 'isabella.martin@example.com',
        patientPhone: '+1 (555) 678-9015',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '15:00',
        endTime: '15:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Mitral valve evaluation.',
        createdAt: '2026-10-11T11:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-12',
        bookingRef: 'SHAS-2026-CH12',
        patientId: 'pat-16',
        patientName: 'James Clark',
        patientEmail: 'james.clark@example.com',
        patientPhone: '+1 (555) 789-0126',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '15:30',
        endTime: '16:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Stress test consultation.',
        createdAt: '2026-10-11T12:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-13',
        bookingRef: 'SHAS-2026-CH13',
        patientId: 'pat-17',
        patientName: 'Charlotte Lewis',
        patientEmail: 'charlotte.lewis@example.com',
        patientPhone: '+1 (555) 890-1237',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '16:00',
        endTime: '16:30',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Echocardiogram follow-up.',
        createdAt: '2026-10-11T13:00:00.000Z'
      },
      {
        id: 'apt-demo-chen-14',
        bookingRef: 'SHAS-2026-CH14',
        patientId: 'pat-18',
        patientName: 'Henry Walker',
        patientEmail: 'henry.walker@example.com',
        patientPhone: '+1 (555) 901-2348',
        doctorId: 'doc-cardio-1',
        doctorName: 'Dr. Marcus Chen',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        appointmentDate: tomorrow,
        startTime: '16:30',
        endTime: '17:00',
        consultationFee: 120,
        status: 'CONFIRMED',
        notes: 'Final afternoon consultation slot.',
        createdAt: '2026-10-11T14:00:00.000Z'
      },

      // Additional Appointments for other doctors to populate statistics and lists
      // Today appointments
      {
        id: 'apt-today-1',
        bookingRef: 'SHAS-2026-TD01',
        patientId: 'pat-19',
        patientName: 'Amelia Young',
        patientEmail: 'amelia.young@example.com',
        patientPhone: '+1 (555) 012-3459',
        doctorId: 'doc-gen-1',
        doctorName: 'Dr. Sarah Lin',
        departmentId: 'dept-gen-med',
        departmentName: 'General Medicine',
        appointmentDate: today,
        startTime: '10:00',
        endTime: '10:20',
        consultationFee: 85,
        status: 'CONFIRMED',
        notes: 'Routine health assessment.',
        createdAt: '2026-10-12T08:00:00.000Z'
      },
      {
        id: 'apt-today-2',
        bookingRef: 'SHAS-2026-TD02',
        patientId: 'pat-20',
        patientName: 'Daniel King',
        patientEmail: 'daniel.king@example.com',
        patientPhone: '+1 (555) 123-4570',
        doctorId: 'doc-ortho-1',
        doctorName: 'Dr. Rachel Adams',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopedics',
        appointmentDate: today,
        startTime: '11:00',
        endTime: '11:30',
        consultationFee: 135,
        status: 'CONFIRMED',
        notes: 'Knee joint assessment.',
        createdAt: '2026-10-12T09:00:00.000Z'
      },
      {
        id: 'apt-today-3',
        bookingRef: 'SHAS-2026-TD03',
        patientId: 'pat-1', // Demo Patient Sarah Jenkins has an upcoming checkup with Dr. Lin in 4 days
        bookingRef: 'SHAS-2026-SJ01',
        patientId: 'pat-1',
        patientName: 'Sarah Jenkins',
        patientEmail: 'sarah.jenkins@example.com',
        patientPhone: '+1 (555) 234-5678',
        doctorId: 'doc-gen-1',
        doctorName: 'Dr. Sarah Lin',
        departmentId: 'dept-gen-med',
        departmentName: 'General Medicine',
        appointmentDate: day4,
        startTime: '10:40',
        endTime: '11:00',
        consultationFee: 85,
        status: 'CONFIRMED',
        notes: 'General checkup and lab work review.',
        createdAt: '2026-10-13T10:00:00.000Z'
      },
      // Past Completed Appointments
      {
        id: 'apt-past-1',
        bookingRef: 'SHAS-2026-P001',
        patientId: 'pat-1',
        patientName: 'Sarah Jenkins',
        patientEmail: 'sarah.jenkins@example.com',
        patientPhone: '+1 (555) 234-5678',
        doctorId: 'doc-derma-1',
        doctorName: 'Dr. David Kim',
        departmentId: 'dept-derma',
        departmentName: 'Dermatology',
        appointmentDate: twoDaysAgo,
        startTime: '14:00',
        endTime: '14:20',
        consultationFee: 110,
        status: 'COMPLETED',
        notes: 'Routine skin spot inspection completed successfully.',
        createdAt: '2026-10-05T09:00:00.000Z'
      },
      {
        id: 'apt-past-2',
        bookingRef: 'SHAS-2026-P002',
        patientId: 'pat-22',
        patientName: 'Matthew Lopez',
        patientEmail: 'matthew.lopez@example.com',
        patientPhone: '+1 (555) 345-6792',
        doctorId: 'doc-ortho-2',
        doctorName: 'Dr. Anthony Ross',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopedics',
        appointmentDate: yesterday,
        startTime: '10:00',
        endTime: '10:30',
        consultationFee: 125,
        status: 'COMPLETED',
        notes: 'Physical therapy referral issued.',
        createdAt: '2026-10-06T10:00:00.000Z'
      },
      // Past Cancelled Appointment
      {
        id: 'apt-past-3',
        bookingRef: 'SHAS-2026-P003',
        patientId: 'pat-24',
        patientName: 'Jackson Green',
        patientEmail: 'jackson.green@example.com',
        patientPhone: '+1 (555) 567-8914',
        doctorId: 'doc-ent-1',
        doctorName: 'Dr. Michael Thorne',
        departmentId: 'dept-ent',
        departmentName: 'Ear, Nose & Throat (ENT)',
        appointmentDate: yesterday,
        startTime: '15:00',
        endTime: '15:20',
        consultationFee: 90,
        status: 'CANCELLED',
        cancellationReason: 'Patient travel conflict',
        cancelledAt: new Date(Date.now() - 86400000).toISOString(),
        cancelledBy: 'Patient',
        notes: 'Cancelled with prior notice.',
        createdAt: '2026-10-07T11:00:00.000Z'
      }
    ];

    // Seed Waiting List Entries:
    // Key Demo Scenario:
    // 1) Sarah Jenkins (pat-1) is waiting specifically for Dr. Marcus Chen (Cardiology) tomorrow morning! (Position #1)
    // 2) Marcus Vance (pat-2) is waiting for Cardiology (Any Doctor) tomorrow morning! (Position #2)
    // 3) Alexander Scott has an active pending offer to show the live countdown offer banner immediately.
    const waitlist = [
      {
        id: 'wl-demo-1',
        patientId: 'pat-1',
        patientName: 'Sarah Jenkins',
        patientEmail: 'sarah.jenkins@example.com',
        patientPhone: '+1 (555) 234-5678',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        preferredDoctorId: 'doc-cardio-1',
        preferredDoctorName: 'Dr. Marcus Chen',
        preferredStartDate: tomorrow,
        preferredEndDate: tomorrow,
        preferredTimeRange: 'morning', // 'morning' (08:00-12:00) | 'afternoon' (12:00-17:00) | 'any'
        urgency: 'Medium',
        notes: 'Need urgently for cardiology clearance before travel.',
        queuePosition: 1,
        status: 'WAITING', // WAITING | OFFERED | ACCEPTED | DECLINED | EXPIRED | CANCELLED | FULFILLED
        offeredSlot: null,
        offerExpiresAt: null,
        createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: 'wl-demo-2',
        patientId: 'pat-2',
        patientName: 'Marcus Vance',
        patientEmail: 'marcus.vance@example.com',
        patientPhone: '+1 (555) 345-6789',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology',
        preferredDoctorId: 'ANY', // Any doctor in cardiology
        preferredDoctorName: 'Any Cardiologist',
        preferredStartDate: tomorrow,
        preferredEndDate: tomorrow,
        preferredTimeRange: 'any',
        urgency: 'High',
        notes: 'Chest tightness checkup requested as soon as available.',
        queuePosition: 2,
        status: 'WAITING',
        offeredSlot: null,
        offerExpiresAt: null,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'wl-demo-3',
        patientId: 'pat-5',
        patientName: 'Chloe Davis',
        patientEmail: 'chloe.davis@example.com',
        patientPhone: '+1 (555) 678-9012',
        departmentId: 'dept-pedia',
        departmentName: 'Pediatrics',
        preferredDoctorId: 'doc-pedia-1',
        preferredDoctorName: 'Dr. Maya Patel',
        preferredStartDate: dayAfter,
        preferredEndDate: day3,
        preferredTimeRange: 'afternoon',
        urgency: 'Standard',
        notes: 'Vaccination catch-up schedule.',
        queuePosition: 1,
        status: 'WAITING',
        offeredSlot: null,
        offerExpiresAt: null,
        createdAt: new Date(Date.now() - 14400000).toISOString()
      },
      {
        // Pre-configured pending offer for Alexander Scott to showcase immediate offer handling
        id: 'wl-demo-4',
        patientId: 'pat-6',
        patientName: 'Alexander Scott',
        patientEmail: 'alexander.scott@example.com',
        patientPhone: '+1 (555) 789-0123',
        departmentId: 'dept-derma',
        departmentName: 'Dermatology',
        preferredDoctorId: 'doc-derma-1',
        preferredDoctorName: 'Dr. David Kim',
        preferredStartDate: dayAfter,
        preferredEndDate: dayAfter,
        preferredTimeRange: 'afternoon',
        urgency: 'Medium',
        notes: 'Eczema flare-up review.',
        queuePosition: 1,
        status: 'OFFERED',
        offeredSlot: {
          doctorId: 'doc-derma-1',
          doctorName: 'Dr. David Kim',
          departmentId: 'dept-derma',
          departmentName: 'Dermatology',
          date: dayAfter,
          startTime: '14:20',
          endTime: '14:40',
          consultationFee: 110
        },
        offerExpiresAt: Date.now() + 12 * 60 * 1000, // 12 minutes from now
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    // Seed Active Waitlist Temporary Slot Reservations
    const waitlistOffers = [
      {
        waitlistId: 'wl-demo-4',
        patientId: 'pat-6',
        doctorId: 'doc-derma-1',
        date: dayAfter,
        startTime: '14:20',
        endTime: '14:40',
        expiresAt: Date.now() + 12 * 60 * 1000
      }
    ];

    // Seed Notifications
    const notifications = [
      {
        id: 'notif-1',
        recipientId: 'pat-1',
        role: 'patient',
        title: 'Waitlist Confirmation',
        message: 'You have been added to the waiting list for Dr. Marcus Chen (Queue #1) for tomorrow morning.',
        type: 'waitlist',
        read: false,
        timestamp: new Date(Date.now() - 7100000).toISOString(),
        actionData: { waitlistId: 'wl-demo-1' }
      },
      {
        id: 'notif-2',
        recipientId: 'pat-1',
        role: 'patient',
        title: 'Upcoming Appointment Reminder',
        message: 'Your General Medicine consultation with Dr. Sarah Lin is scheduled for ' + Utils.formatDate(day4) + ' at 10:40 AM.',
        type: 'appointment',
        read: true,
        timestamp: new Date(Date.now() - 12000000).toISOString(),
        actionData: { appointmentId: 'apt-today-3' }
      },
      {
        id: 'notif-3',
        recipientId: 'pat-6',
        role: 'patient',
        title: 'Slot Offered!',
        message: 'A Dermatology slot with Dr. David Kim is now available for you on ' + Utils.formatDate(dayAfter) + ' at 2:20 PM. Please accept or decline.',
        type: 'offer',
        read: false,
        timestamp: new Date(Date.now() - 1700000).toISOString(),
        actionData: { waitlistId: 'wl-demo-4' }
      },
      {
        id: 'notif-4',
        recipientId: 'admin-1',
        role: 'admin',
        title: 'System Initialized',
        message: 'Smart Hospital Appointment System loaded with 8 departments and 12 specialist physicians.',
        type: 'system',
        read: false,
        timestamp: new Date(Date.now() - 36000000).toISOString()
      }
    ];

    // Seed Application Settings
    const settings = {
      hospitalName: 'St. Jude Metropolitan Hospital',
      tagline: 'Smart Health, Your Time, Simplified',
      allowCancellationAnytime: true,
      cancellationCutoffHours: 2,
      offerExpiryMinutes: 15,
      autoProcessWaitlist: true,
      maxWaitlistPerPatient: 3,
      allowCrossDoctorWaitlist: true,
      currencySymbol: '$',
      demoMode: true
    };

    // Seed Audit Logs
    const auditLogs = [
      {
        id: 'log-seed-1',
        action: 'SYSTEM_INIT',
        details: { description: 'Synthetic hospital demo dataset initialized.' },
        timestamp: new Date(Date.now() - 36000000).toISOString()
      },
      {
        id: 'log-seed-2',
        action: 'WAITLIST_JOIN',
        details: { patientName: 'Sarah Jenkins', doctorName: 'Dr. Marcus Chen', queuePosition: 1 },
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'log-seed-3',
        action: 'WAITLIST_OFFER_ISSUED',
        details: { patientName: 'Alexander Scott', doctorName: 'Dr. David Kim', time: '14:20' },
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    return {
      departments,
      doctors,
      patients,
      appointments,
      waitlist,
      waitlistOffers,
      notifications,
      settings,
      auditLogs
    };
  }

  /**
   * Initializes seed data into LocalStorage if keys are absent or forceReset is requested
   */
  function initialize(forceReset = false) {
    const Storage = window.SHAS.Storage;
    const existingVersion = Storage.getData(Storage.KEYS.VERSION);

    if (forceReset || !existingVersion) {
      console.log('[SHAS SeedData] Seeding initial hospital data...');
      const seeds = generateSeedData();

      Storage.setData(Storage.KEYS.VERSION, Storage.STORAGE_VERSION, true);
      Storage.setData(Storage.KEYS.DEPARTMENTS, seeds.departments, true);
      Storage.setData(Storage.KEYS.DOCTORS, seeds.doctors, true);
      Storage.setData(Storage.KEYS.PATIENTS, seeds.patients, true);
      Storage.setData(Storage.KEYS.APPOINTMENTS, seeds.appointments, true);
      Storage.setData(Storage.KEYS.WAITLIST, seeds.waitlist, true);
      Storage.setData(Storage.KEYS.WAITLIST_OFFERS, seeds.waitlistOffers, true);
      Storage.setData(Storage.KEYS.NOTIFICATIONS, seeds.notifications, true);
      Storage.setData(Storage.KEYS.SETTINGS, seeds.settings, true);
      Storage.setData(Storage.KEYS.AUDIT_LOGS, seeds.auditLogs, true);

      // Ensure default demo session is set if not already
      if (!Storage.getData(Storage.KEYS.DEMO_SESSION)) {
        Storage.setDemoSession('patient', 'pat-1', 'Sarah Jenkins');
      }

      console.log('[SHAS SeedData] Seeding complete.');
      return true;
    }
    return false;
  }

  return {
    generateSeedData,
    initialize
  };
})();
