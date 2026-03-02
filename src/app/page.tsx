'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  GraduationCap,
  Brain,
  Heart,
  Stethoscope,
  Microscope,
  Pill,
  Shield,
  FileText,
  ChevronRight,
  Timer,
  Award,
  BarChart3
} from 'lucide-react'

// Types
interface PastQuestion {
  question: string
  type: 'long' | 'short' | 'mcq' | 'viva'
  year?: string
  university?: string
}

interface Topic {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedHours: number
  completed: boolean
  priority: number
  textbookReference?: string
  notes?: string
  pastQuestions?: PastQuestion[]
}

interface System {
  id: string
  name: string
  topics: Topic[]
}

interface Subject {
  id: string
  name: string
  examDate: Date
  textbook: string
  color: string
  icon: React.ReactNode
  systems: System[]
}

// Difficulty levels explanation:
// Easy: Straightforward concepts, direct memorization, clinical correlations easy
// Medium: Requires understanding of pathophysiology, some integration needed
// Hard: Complex mechanisms, multiple systems involved, requires deep understanding

// Syllabus Data with Difficulty Analysis
const syllabusData: Subject[] = [
  {
    id: 'pathology',
    name: 'Pathology',
    examDate: new Date('2026-04-08'),
    textbook: 'Robbins Basic Pathology (10th Edition)',
    color: 'bg-rose-500',
    icon: <Heart className="h-5 w-5" />,
    systems: [
      {
        id: 'cvs',
        name: 'Cardiovascular System',
        topics: [
          { 
            id: 'rf', 
            name: 'Rheumatic Fever', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 10: Blood Vessels & Heart',
            pastQuestions: [
              { question: 'Define Rheumatic Fever. Describe the etiology, pathogenesis, and morphology of rheumatic fever.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Aschoff bodies', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Enumerate the major and minor criteria for diagnosis of rheumatic fever (Jones Criteria).', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the cardiac lesions in rheumatic fever.', type: 'long', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: All are true about rheumatic fever except: a) Caused by Group A β-hemolytic streptococci b) Aschoff bodies are pathognomonic c) Mitral valve is most commonly affected d) Causes non-bacterial thrombotic endocarditis', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'ie', 
            name: 'Infective Endocarditis', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 10: Blood Vessels & Heart',
            pastQuestions: [
              { question: 'Define Infective Endocarditis. Classify and describe the etiology, pathogenesis, and complications of infective endocarditis.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Vegetations in infective endocarditis', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Differentiate between acute and subacute bacterial endocarditis.', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the complications of infective endocarditis.', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Most common organism causing subacute infective endocarditis is: a) Staphylococcus aureus b) Streptococcus viridans c) Enterococcus d) Candida', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'body-fluids', 
            name: 'Abnormal Findings in Body Fluids', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 6, 
            textbookReference: 'Chapter 2: Cell Injury',
            pastQuestions: [
              { question: 'Write short notes on: Exudate vs Transudate', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Describe the composition and significance of pleural effusion in different diseases.', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Which of the following is a transudate? a) Pus b) Serous fluid in heart failure c) Purulent exudate d) Fibrinous exudate', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'ihd', 
            name: 'Ischaemic Heart Disease & Acute Coronary Syndromes', 
            difficulty: 'hard', 
            estimatedHours: 3, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 10: Blood Vessels & Heart',
            pastQuestions: [
              { question: 'Define Ischemic Heart Disease. Describe the etiology, pathogenesis, and morphology of myocardial infarction.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the gross and microscopic changes in myocardial infarction with timeline.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Angina pectoris', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Enumerate the complications of myocardial infarction.', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'Describe the laboratory diagnosis of acute myocardial infarction.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Most sensitive cardiac biomarker for early diagnosis of MI is: a) Troponin I b) CK-MB c) LDH d) Myoglobin', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'cardiomyopathies', 
            name: 'Cardiomyopathies and Tumours of CVS', 
            difficulty: 'hard', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 10: Blood Vessels & Heart',
            pastQuestions: [
              { question: 'Define Cardiomyopathy. Classify and describe the types of cardiomyopathy.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Dilated cardiomyopathy', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Hypertrophic cardiomyopathy', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'Describe the gross and microscopic features of restrictive cardiomyopathy.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Which cardiomyopathy is associated with sudden cardiac death in young athletes? a) Dilated b) Hypertrophic c) Restrictive d) Arrhythmogenic RV', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'git',
        name: 'Gastrointestinal System',
        topics: [
          { 
            id: 'pud', 
            name: 'Peptic Ulcer Disease', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Define peptic ulcer. Describe the etiology, pathogenesis, and morphology of peptic ulcer.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Complications of peptic ulcer', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the role of H. pylori in peptic ulcer disease.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Most common site of peptic ulcer is: a) Duodenum b) Stomach c) Esophagus d) Meckel\'s diverticulum', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'tb-appendix', 
            name: 'TB Intestine and Appendicitis', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Describe the pathology of intestinal tuberculosis.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Acute appendicitis', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Differentiate between Crohn\'s disease and intestinal tuberculosis.', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Most common site of intestinal tuberculosis is: a) Jejunum b) Ileocecal region c) Colon d) Rectum', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'oral-ca', 
            name: 'Oral Cancer and Carcinoma of Esophagus', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Describe the etiology, pathology, and spread of oral carcinoma.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Premalignant lesions of oral cavity', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the types and morphology of esophageal carcinoma.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Most common site of oral cancer in India is: a) Lip b) Tongue c) Buccal mucosa d) Hard palate', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'stomach-ca', 
            name: 'Carcinoma of the Stomach', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Describe the etiology, classification, and morphology of gastric carcinoma.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Lauren classification of gastric carcinoma', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Linitis plastica', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Most common type of gastric carcinoma is: a) Intestinal type b) Diffuse type c) Signet ring type d) Mucinous type', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'malabsorption', 
            name: 'Malabsorption Syndrome', 
            difficulty: 'hard', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Define malabsorption. Describe the etiology, pathogenesis, and pathology of malabsorption syndrome.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Celiac disease', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the morphological changes in small intestine in malabsorption.', type: 'short', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'ibd', 
            name: 'Inflammatory Bowel Disease', 
            difficulty: 'hard', 
            estimatedHours: 3, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Define IBD. Differentiate between Crohn\'s disease and Ulcerative colitis.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the etiology, pathology, and complications of Crohn\'s disease.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Toxic megacolon', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Enumerate the extraintestinal manifestations of IBD.', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Which is a feature of Crohn\'s disease but not UC? a) Crypt abscesses b) Transmural inflammation c) Pseudopolyps d) Lead pipe appearance', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'colon-ca', 
            name: 'Carcinoma of the Colon', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 14: Gastrointestinal Tract',
            pastQuestions: [
              { question: 'Describe the etiology, pathology, and staging of colorectal carcinoma.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Adenoma-carcinoma sequence', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Describe the Duke\'s staging of colorectal carcinoma.', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Most common site of colon cancer is: a) Cecum b) Ascending colon c) Sigmoid colon d) Rectum', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'bilirubin', 
            name: 'Bilirubin Metabolism, Jaundice & Hyperbilirubinemia', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 15: Liver & Biliary Tract',
            pastQuestions: [
              { question: 'Describe the metabolism of bilirubin and classify jaundice.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Causes of unconjugated hyperbilirubinemia', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Differentiate between hemolytic and obstructive jaundice.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: In Crigler-Najjar syndrome type I, there is: a) Partial deficiency of UDPGT b) Complete deficiency of UDPGT c) Impaired excretion d) Impaired uptake', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'viral-hepatitis', 
            name: 'Viral and Toxic Hepatitis', 
            difficulty: 'medium', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 15: Liver & Biliary Tract',
            pastQuestions: [
              { question: 'Describe the etiology, pathology, and complications of viral hepatitis.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Compare hepatitis A, B, and C viruses.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Morphology of acute viral hepatitis', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Describe the serological markers of Hepatitis B infection.', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Which hepatitis virus requires HBV for its replication? a) HAV b) HCV c) HDV d) HEV', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'hepatic-failure', 
            name: 'Hepatic Failure, Portal Hypertension & Cirrhosis', 
            difficulty: 'hard', 
            estimatedHours: 3, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 15: Liver & Biliary Tract',
            pastQuestions: [
              { question: 'Define cirrhosis. Describe the etiology, pathogenesis, and morphology of cirrhosis.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the causes and complications of portal hypertension.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Morphology of micronodular cirrhosis', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Enumerate the causes and features of hepatic failure.', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Most common cause of cirrhosis in India is: a) Alcohol b) Hepatitis B c) Hepatitis C d) NASH', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'cholecystitis', 
            name: 'Acute Cholecystitis and Cholelithiasis', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 15: Liver & Biliary Tract',
            pastQuestions: [
              { question: 'Describe the etiology, pathology, and complications of cholelithiasis.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Acute cholecystitis', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Classify gallstones and describe their composition.', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Most common type of gallstone is: a) Cholesterol stone b) Pigment stone c) Mixed stone d) Calcium stone', type: 'mcq', year: '2022', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'ald-hcc', 
            name: 'Alcoholic Liver Disease and Hepatocellular Carcinoma', 
            difficulty: 'hard', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 15: Liver & Biliary Tract',
            pastQuestions: [
              { question: 'Describe the pathogenesis and morphology of alcoholic liver disease.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the etiology, pathology, and spread of hepatocellular carcinoma.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Alcoholic hepatitis', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Alpha-fetoprotein in HCC', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: All are features of alcoholic hepatitis except: a) Mallory bodies b) Neutrophil infiltration c) Bridging fibrosis d) Ballooning degeneration', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'respiratory',
        name: 'Respiratory System',
        topics: [
          { id: 'tb-lung', name: 'Tuberculosis', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 13: Lung' },
          { id: 'pneumonia', name: 'Pneumonia', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 8, textbookReference: 'Chapter 13: Lung' },
          { id: 'lung-abscess', name: 'Lung Abscess', difficulty: 'easy', estimatedHours: 1, completed: false, priority: 6, textbookReference: 'Chapter 13: Lung' },
          { id: 'oad', name: 'OAD and Bronchiectasis', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 13: Lung' },
          { id: 'lung-tumours', name: 'Tumours of Lung and Pleura', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 13: Lung' },
          { id: 'occupational', name: 'Occupational Lung Disease', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 13: Lung' },
        ]
      },
      {
        id: 'gus',
        name: 'Genitourinary System',
        topics: [
          { id: 'glomerular', name: 'Normal Histology and Glomerular Diseases', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 17: Kidney' },
          { id: 'iga-nephropathy', name: 'IgA Nephropathy and Systemic Disease Manifestations', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 17: Kidney' },
          { id: 'tubular', name: 'Diseases of Tubular Interstitium and ATN', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 17: Kidney' },
          { id: 'vascular-kidney', name: 'Vascular Disease of the Kidney', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 17: Kidney' },
          { id: 'arf-crf', name: 'ARF and CRF', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 17: Kidney' },
          { id: 'pyelonephritis', name: 'Pyelonephritis and Reflux Nephropathy', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 17: Kidney' },
          { id: 'cystic-kidney', name: 'Cystic Disease of Kidney', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 6, textbookReference: 'Chapter 17: Kidney' },
          { id: 'renal-stone', name: 'Renal Stone Disease and Obstructive Uropathy', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 17: Kidney' },
          { id: 'renal-tumours', name: 'Renal Tumours', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 17: Kidney' },
          { id: 'testicular-tumours', name: 'Testicular Tumours', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 18: Lower Urinary Tract' },
          { id: 'urothelial', name: 'Urothelial Tumours and Thrombotic Microangiopathies', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 18: Lower Urinary Tract' },
          { id: 'prostate', name: 'Prostatitis, BPH, and Carcinoma of Prostate', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 18: Lower Urinary Tract' },
        ]
      },
      {
        id: 'female-repro',
        name: 'Female Reproductive System & Breast',
        topics: [
          { id: 'cervix', name: 'Carcinoma of Cervix and Cervicitis', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'leiomyoma', name: 'Leiomyoma and Leiomyosarcoma', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'endometriosis', name: 'Endometriosis and Adenomyosis', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'ovarian-tumours', name: 'Ovarian Tumours', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'endometrial-ca', name: 'Endometrial Carcinoma', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'gtn', name: 'Gestational Trophoblastic Neoplasms', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 19: Female Genital Tract' },
          { id: 'breast-path', name: 'Breast Pathology: Benign, Phyllodes, Carcinoma', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 20: Breast' },
          { id: 'gynaecomastia', name: 'Gynaecomastia', difficulty: 'easy', estimatedHours: 1, completed: false, priority: 5, textbookReference: 'Chapter 20: Breast' },
        ]
      },
      {
        id: 'endocrine',
        name: 'Endocrine & Childhood Diseases',
        topics: [
          { id: 'cytogenetics', name: 'Cytogenic Abnormalities, Mutations & Storage Disorders', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 7, textbookReference: 'Chapter 6: Genetic Disorders' },
          { id: 'thyroid-swelling', name: 'Thyroid Swellings (Etiology & Pathogenesis)', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 21: Endocrine System' },
          { id: 'thyrotoxicosis', name: 'Thyrotoxicosis and Hypothyroidism', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 21: Endocrine System' },
        ]
      }
    ]
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    examDate: new Date('2026-04-07'),
    textbook: 'KD Tripathi - Essentials of Medical Pharmacology (9th Edition)',
    color: 'bg-blue-500',
    icon: <Pill className="h-5 w-5" />,
    systems: [
      {
        id: 'cvs-pharm',
        name: 'Cardiovascular System',
        topics: [
          { 
            id: 'antianginal', 
            name: 'Antianginal Drugs', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 37-39: Cardiovascular Drugs',
            pastQuestions: [
              { question: 'Classify antianginal drugs. Describe the mechanism of action of nitrates.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Nitroglycerin', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Describe the pharmacology of beta blockers in angina.', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Which antianginal drug is contraindicated in variant angina? a) Nitrates b) Beta blockers c) Calcium channel blockers d) Potassium channel openers', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antihypertensives', 
            name: 'Antihypertensive Drugs', 
            difficulty: 'hard', 
            estimatedHours: 3, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 37-39: Cardiovascular Drugs',
            pastQuestions: [
              { question: 'Classify antihypertensive drugs. Describe the mechanism of action of ACE inhibitors.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the rationale behind combination therapy in hypertension.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Thiazide diuretics in hypertension', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Calcium channel blockers', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: First line drug for hypertension in diabetic patient is: a) Beta blocker b) ACE inhibitor c) Thiazide d) Calcium channel blocker', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antiarrhythmics', 
            name: 'Antiarrhythmic Drugs', 
            difficulty: 'hard', 
            estimatedHours: 3, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 40: Antiarrhythmic Drugs',
            pastQuestions: [
              { question: 'Classify antiarrhythmic drugs (Vaughan Williams classification).', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the pharmacology of amiodarone.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Lidocaine in arrhythmias', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Which drug is used in torsades de pointes? a) Amiodarone b) Magnesium sulfate c) Lidocaine d) Verapamil', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'heart-failure', 
            name: 'Drugs for Heart Failure', 
            difficulty: 'hard', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 41: Drugs for Heart Failure',
            pastQuestions: [
              { question: 'Describe the pharmacotherapy of congestive heart failure.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Discuss the role of digoxin in heart failure.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: ACE inhibitors in heart failure', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Which is NOT used in heart failure? a) Digoxin b) Furosemide c) Verapamil d) Carvedilol', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'anticoagulants', 
            name: 'Anticoagulants and Antiplatelet Drugs', 
            difficulty: 'medium', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 43: Anticoagulants',
            pastQuestions: [
              { question: 'Classify anticoagulants. Describe the pharmacology of heparin.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Compare and contrast heparin and warfarin.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Antiplatelet drugs', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: NOACs', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Antidote for heparin is: a) Vitamin K b) Protamine sulfate c) FFP d) Idarucizumab', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'lipid-lowering', 
            name: 'Lipid Lowering Agents', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 42: Hypolipidemic Drugs',
            pastQuestions: [
              { question: 'Classify hypolipidemic drugs. Describe the mechanism of action of statins.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Adverse effects of statins', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'MCQ: Which drug reduces cholesterol absorption from intestine? a) Statins b) Ezetimibe c) Fibrates d) Niacin', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'kidney-pharm',
        name: 'Kidney',
        topics: [
          { 
            id: 'diuretics', 
            name: 'Diuretics', 
            difficulty: 'medium', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 35: Diuretics',
            pastQuestions: [
              { question: 'Classify diuretics. Describe the mechanism of action of loop diuretics.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Compare thiazide and loop diuretics.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Spironolactone', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Potassium sparing diuretics', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Site of action of thiazide diuretic is: a) Proximal tubule b) Loop of Henle c) Distal convoluted tubule d) Collecting duct', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'haematinics',
        name: 'Haematinics',
        topics: [
          { 
            id: 'iron', 
            name: 'Iron and Iron Deficiency', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 44: Haematinics',
            pastQuestions: [
              { question: 'Describe the pharmacology of iron including its absorption, transport, and utilization.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Iron deficiency anemia treatment', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Parenteral iron preparations', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Iron is best absorbed from: a) Stomach b) Duodenum c) Jejunum d) Ileum', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'vit-b12', 
            name: 'Vitamin B12 and Folic Acid', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 44: Haematinics',
            pastQuestions: [
              { question: 'Describe the pharmacology of Vitamin B12.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Folic acid in pregnancy', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'MCQ: Vitamin B12 deficiency causes: a) Microcytic anemia b) Macrocytic anemia c) Normocytic anemia d) Hemolytic anemia', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'erythropoietin', 
            name: 'Erythropoietin', 
            difficulty: 'easy', 
            estimatedHours: 1, 
            completed: false, 
            priority: 6, 
            textbookReference: 'Chapter 44: Haematinics',
            pastQuestions: [
              { question: 'Write short notes on: Erythropoietin', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'MCQ: Erythropoietin is used in: a) Iron deficiency b) CKD anemia c) Aplastic anemia d) Thalassemia', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'git-pharm',
        name: 'Gastrointestinal System',
        topics: [
          { 
            id: 'antiulcer', 
            name: 'Antiulcer Drugs', 
            difficulty: 'easy', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 46: Drugs for Peptic Ulcer',
            pastQuestions: [
              { question: 'Classify antiulcer drugs. Describe the pharmacology of proton pump inhibitors.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: H2 receptor blockers', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Misoprostol', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Drug of choice for H. pylori eradication includes all except: a) Amoxicillin b) Clarithromycin c) Metronidazole d) Vancomycin', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antiemetics', 
            name: 'Antiemetics', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 47: Emetics & Antiemetics',
            pastQuestions: [
              { question: 'Classify antiemetics with mechanism of action.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Ondansetron', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Drug of choice for chemotherapy induced vomiting is: a) Metoclopramide b) Ondansetron c) Promethazine d) Domperidone', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'laxatives', 
            name: 'Laxatives and Purgatives', 
            difficulty: 'easy', 
            estimatedHours: 1, 
            completed: false, 
            priority: 6, 
            textbookReference: 'Chapter 48: Laxatives',
            pastQuestions: [
              { question: 'Classify laxatives with examples.', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'MCQ: Osmotic laxative is: a) Bisacodyl b) Lactulose c) Psyllium d) Docusate', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antidiarrheal', 
            name: 'Antidiarrheal Agents', 
            difficulty: 'easy', 
            estimatedHours: 1, 
            completed: false, 
            priority: 6, 
            textbookReference: 'Chapter 49: Antidiarrheals',
            pastQuestions: [
              { question: 'Write short notes on: ORS composition', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'MCQ: Antidiarrheal contraindicated in children is: a) ORS b) Racecadotril c) Loperamide d) Zinc', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      },
      {
        id: 'antimicrobial',
        name: 'Antimicrobial Agents',
        topics: [
          { 
            id: 'penicillins', 
            name: 'Penicillins and Cephalosporins', 
            difficulty: 'medium', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 50-51: Antibiotics',
            pastQuestions: [
              { question: 'Classify penicillins with examples. Describe the mechanism of action and adverse effects.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Classify cephalosporins with examples.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Penicillin resistance', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Beta lactamase inhibitors', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Drug of choice for neurosyphilis is: a) Oral penicillin b) IV Penicillin G c) Ceftriaxone d) Doxycycline', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'macrolides', 
            name: 'Macrolides and Tetracyclines', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 52-53: Antibiotics',
            pastQuestions: [
              { question: 'Describe the pharmacology of macrolide antibiotics.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Azithromycin', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Adverse effects of tetracyclines', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Macrolide that can be given once daily is: a) Erythromycin b) Clarithromycin c) Azithromycin d) Roxithromycin', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'fluoroquinolones', 
            name: 'Fluoroquinolones', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 54: Fluoroquinolones',
            pastQuestions: [
              { question: 'Describe the pharmacology of fluoroquinolones.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Ciprofloxacin', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Fluoroquinolones are contraindicated in: a) Elderly b) Children c) Pregnancy d) Both b and c', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antitubercular', 
            name: 'Antitubercular Drugs', 
            difficulty: 'medium', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 9, 
            textbookReference: 'Chapter 55: Antitubercular Drugs',
            pastQuestions: [
              { question: 'Classify antitubercular drugs. Describe the pharmacology of first line drugs.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the DOTS strategy for TB treatment.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Hepatotoxicity with ATT', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Multi-drug resistant TB', type: 'short', year: '2020', university: 'Saurashtra University' },
              { question: 'MCQ: Most hepatotoxic antitubercular drug is: a) Isoniazid b) Rifampicin c) Pyrazinamide d) Ethambutol', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antifungal', 
            name: 'Antifungal Agents', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 7, 
            textbookReference: 'Chapter 57: Antifungals',
            pastQuestions: [
              { question: 'Classify antifungal drugs with mechanism of action.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Amphotericin B', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'Write short notes on: Azole antifungals', type: 'short', year: '2023', university: 'Saurashtra University' },
              { question: 'MCQ: Antifungal used in candidiasis is: a) Amphotericin B b) Fluconazole c) Both a and b d) None', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antiviral', 
            name: 'Antiviral Drugs', 
            difficulty: 'hard', 
            estimatedHours: 2.5, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 58: Antivirals',
            pastQuestions: [
              { question: 'Classify antiviral drugs. Describe the pharmacology of anti-HIV drugs.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Describe the ART regimen for HIV.', type: 'long', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Acyclovir', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Drug used for influenza is: a) Acyclovir b) Oseltamivir c) Ribavirin d) Ganciclovir', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'antimalarial', 
            name: 'Antimalarial Drugs', 
            difficulty: 'medium', 
            estimatedHours: 2, 
            completed: false, 
            priority: 8, 
            textbookReference: 'Chapter 59: Antimalarials',
            pastQuestions: [
              { question: 'Classify antimalarial drugs. Describe the treatment of uncomplicated malaria.', type: 'long', year: '2023', university: 'Saurashtra University' },
              { question: 'Write short notes on: Artemisinin derivatives', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Chloroquine resistance', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Drug of choice for chloroquine resistant malaria is: a) Quinine b) ACT c) Primaquine d) Mefloquine', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
          { 
            id: 'anthelmintic', 
            name: 'Anthelmintic Drugs', 
            difficulty: 'easy', 
            estimatedHours: 1.5, 
            completed: false, 
            priority: 6, 
            textbookReference: 'Chapter 60: Anthelmintics',
            pastQuestions: [
              { question: 'Classify anthelmintic drugs with examples.', type: 'short', year: '2022', university: 'Saurashtra University' },
              { question: 'Write short notes on: Albendazole', type: 'short', year: '2021', university: 'Gujarat University' },
              { question: 'MCQ: Drug of choice for neurocysticercosis is: a) Mebendazole b) Albendazole c) Praziquantel d) Ivermectin', type: 'mcq', year: '2023', university: 'Saurashtra University' }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'microbiology',
    name: 'Microbiology',
    examDate: new Date('2026-04-09'),
    textbook: 'Apurba Sastry - Essentials of Medical Microbiology (4th Edition)',
    color: 'bg-emerald-500',
    icon: <Microscope className="h-5 w-5" />,
    systems: [
      {
        id: 'cvs-micro',
        name: 'CVS and Blood',
        topics: [
          { id: 'bacteremia', name: 'Bacteremia and Sepsis', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Systemic Microbiology Section' },
          { id: 'endocarditis-micro', name: 'Infective Endocarditis', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Systemic Microbiology: CVS' },
          { id: 'rheumatic-micro', name: 'Rheumatic Fever Microbiology', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Systemic Microbiology: CVS' },
          { id: 'vector-borne', name: 'Vector Borne Infections', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: Blood' },
        ]
      },
      {
        id: 'git-micro',
        name: 'Gastrointestinal System',
        topics: [
          { id: 'git-infections', name: 'GIT Bacterial Infections', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: GIT' },
          { id: 'food-poisoning', name: 'Food Poisoning Bacteria', difficulty: 'easy', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Systemic Microbiology: GIT' },
          { id: 'enteric-fever', name: 'Enteric Fever (Typhoid)', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: GIT' },
          { id: 'cholera', name: 'Cholera', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Systemic Microbiology: GIT' },
          { id: 'intestinal-parasites', name: 'Intestinal Parasites', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Parasitology Section' },
        ]
      },
      {
        id: 'hepatobiliary',
        name: 'Hepatobiliary System',
        topics: [
          { id: 'viral-hep', name: 'Viral Hepatitis (A-E)', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Systemic Microbiology: Hepatobiliary' },
          { id: 'liver-abscess', name: 'Liver Abscess', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Systemic Microbiology: Hepatobiliary' },
          { id: 'biliary-infections', name: 'Biliary Tract Infections', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Systemic Microbiology: Hepatobiliary' },
        ]
      },
      {
        id: 'skin-soft',
        name: 'Skin, Soft Tissue & Musculoskeletal',
        topics: [
          { id: 'skin-infections', name: 'Skin and Soft Tissue Infections', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: Skin' },
          { id: 'cellulitis', name: 'Cellulitis and Necrotizing Infections', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: Skin' },
          { id: 'bone-joint', name: 'Bone and Joint Infections', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Systemic Microbiology: Musculoskeletal' },
          { id: 'mycology', name: 'Cutaneous Mycology', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 6, textbookReference: 'Mycology Section' },
        ]
      }
    ]
  },
  {
    id: 'psm',
    name: 'PSM (Community Medicine)',
    examDate: new Date('2026-04-10'),
    textbook: 'Park\'s Textbook of Preventive and Social Medicine (26th Edition)',
    color: 'bg-amber-500',
    icon: <Shield className="h-5 w-5" />,
    systems: [
      {
        id: 'epidemiology-psm',
        name: 'Epidemiology',
        topics: [
          { id: 'epidemiology-concepts', name: 'Concepts of Epidemiology', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 3: Epidemiology' },
          { id: 'epidemiology-methods', name: 'Epidemiological Methods', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 3: Epidemiology' },
          { id: 'study-designs', name: 'Study Designs', difficulty: 'hard', estimatedHours: 3, completed: false, priority: 9, textbookReference: 'Chapter 3: Epidemiology' },
          { id: 'screening', name: 'Screening for Disease', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 4: Screening' },
          { id: 'disease-surveillance', name: 'Disease Surveillance', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 3: Epidemiology' },
        ]
      },
      {
        id: 'immunization-psm',
        name: 'Immunization',
        topics: [
          { id: 'immunization-basics', name: 'Principles of Immunization', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 6: Immunization' },
          { id: 'immunization-schedule', name: 'National Immunization Schedule', difficulty: 'easy', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 6: Immunization' },
          { id: 'cold-chain', name: 'Cold Chain Management', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 6: Immunization' },
          { id: 'vaccine-preventable', name: 'Vaccine Preventable Diseases', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 6: Immunization' },
          { id: 'adverse-effects', name: 'Adverse Events Following Immunization', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 6: Immunization' },
        ]
      },
      {
        id: 'nutritional-psm',
        name: 'Nutritional',
        topics: [
          { id: 'nutrition-basics', name: 'Nutrition and Health', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 10: Nutrition' },
          { id: 'nutritional-deficiency', name: 'Nutritional Deficiency Disorders', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 10: Nutrition' },
          { id: 'protein-energy', name: 'Protein Energy Malnutrition', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 10: Nutrition' },
          { id: 'vitamin-deficiency', name: 'Vitamin Deficiency Diseases', difficulty: 'easy', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 10: Nutrition' },
          { id: 'nutritional-programmes', name: 'National Nutritional Programmes', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 10: Nutrition' },
        ]
      },
      {
        id: 'environmental-psm',
        name: 'Environmental',
        topics: [
          { id: 'environmental-health', name: 'Environmental Health Hazards', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 11: Environment' },
          { id: 'water-supply', name: 'Water Supply and Waterborne Diseases', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 8, textbookReference: 'Chapter 12: Water' },
          { id: 'air-pollution', name: 'Air Pollution and Health', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 7, textbookReference: 'Chapter 11: Environment' },
          { id: 'waste-disposal', name: 'Waste Disposal Methods', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 13: Waste Disposal' },
          { id: 'housing-health', name: 'Housing and Health', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 6, textbookReference: 'Chapter 14: Housing' },
        ]
      },
      {
        id: 'occupational-psm',
        name: 'Occupational',
        topics: [
          { id: 'occupational-health', name: 'Occupational Health Basics', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 15: Occupational Health' },
          { id: 'occupational-diseases', name: 'Occupational Diseases', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 15: Occupational Health' },
          { id: 'occupational-hazards', name: 'Occupational Hazards', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 15: Occupational Health' },
          { id: 'ergonomics', name: 'Ergonomics', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 6, textbookReference: 'Chapter 15: Occupational Health' },
        ]
      }
    ]
  },
  {
    id: 'fm',
    name: 'Forensic Medicine',
    examDate: new Date('2026-04-11'),
    textbook: 'KS Narayan Reddy - The Essentials of Forensic Medicine & Toxicology (36th Edition)',
    color: 'bg-purple-500',
    icon: <FileText className="h-5 w-5" />,
    systems: [
      {
        id: 'legal-procedure-fm',
        name: 'Legal Procedure',
        topics: [
          { id: 'legal-procedure-basics', name: 'Introduction to Legal Procedure', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 1: Introduction' },
          { id: 'indian-legal-system', name: 'Indian Legal System', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 1: Legal System' },
          { id: 'medical-evidence', name: 'Medical Evidence', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 2: Medical Evidence' },
          { id: 'witness-court', name: 'Doctor as Witness in Court', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 2: Medical Evidence' },
          { id: 'dying-declaration', name: 'Dying Declaration', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 8, textbookReference: 'Chapter 2: Medical Evidence' },
        ]
      },
      {
        id: 'medical-law-ethics-fm',
        name: 'Medical Law and Ethics',
        topics: [
          { id: 'medical-ethics-basics', name: 'Medical Ethics Principles', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 25: Medical Ethics' },
          { id: 'medical-council', name: 'Medical Council of India/NMC', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 25: Medical Ethics' },
          { id: 'professional-misconduct', name: 'Professional Misconduct', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 25: Medical Ethics' },
          { id: 'consent', name: 'Consent in Medical Practice', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 26: Consent' },
          { id: 'medical-negligence', name: 'Medical Negligence', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 27: Negligence' },
          { id: 'consumer-protection', name: 'Consumer Protection Act & Medicine', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 27: Negligence' },
        ]
      },
      {
        id: 'identification-fm',
        name: 'Identification',
        topics: [
          { id: 'identification-basics', name: 'Methods of Identification', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 3: Identification' },
          { id: 'corpus-delicti', name: 'Corpus Delicti', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 3: Identification' },
          { id: 'age-estimation', name: 'Age Estimation', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 3: Identification' },
          { id: 'sex-determination', name: 'Sex Determination', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 3: Identification' },
          { id: 'dna-fingerprinting', name: 'DNA Fingerprinting', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 3: Identification' },
          { id: 'identity-from-skeletal', name: 'Identification from Skeletal Remains', difficulty: 'hard', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 3: Identification' },
        ]
      },
      {
        id: 'ml-autopsy-fm',
        name: 'ML Autopsy',
        topics: [
          { id: 'autopsy-basics', name: 'Medicolegal Autopsy - Principles', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 4: Autopsy' },
          { id: 'autopsy-procedure', name: 'Autopsy Procedure & Techniques', difficulty: 'medium', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 4: Autopsy' },
          { id: 'viscera-preservation', name: 'Viscera Preservation & Analysis', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 4: Autopsy' },
          { id: 'autopsy-report', name: 'Autopsy Report Writing', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 8, textbookReference: 'Chapter 4: Autopsy' },
          { id: 'exhumation', name: 'Exhumation', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 4: Autopsy' },
        ]
      },
      {
        id: 'death-causes-fm',
        name: 'Death and It\'s Cause',
        topics: [
          { id: 'death-definition', name: 'Definition and Types of Death', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 5: Death' },
          { id: 'modes-of-death', name: 'Modes of Death', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 5: Death' },
          { id: 'cause-of-death', name: 'Cause of Death - Classification', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
          { id: 'manner-of-death', name: 'Manner of Death', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 5: Death' },
          { id: 'sudden-death', name: 'Sudden Death', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 5: Death' },
          { id: 'brain-death', name: 'Brain Death & Organ Transplantation', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
        ]
      },
      {
        id: 'postmortem-changes-fm',
        name: 'Postmortem Changes',
        topics: [
          { id: 'postmortem-signs', name: 'Signs of Death', difficulty: 'easy', estimatedHours: 1.5, completed: false, priority: 8, textbookReference: 'Chapter 5: Death' },
          { id: 'algor-mortis', name: 'Algor Mortis (Cooling of Body)', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
          { id: 'livor-mortis', name: 'Livor Mortis (Postmortem Lividity)', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
          { id: 'rigor-mortis', name: 'Rigor Mortis', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
          { id: 'decomposition', name: 'Decomposition Changes', difficulty: 'medium', estimatedHours: 2, completed: false, priority: 8, textbookReference: 'Chapter 5: Death' },
          { id: 'estimation-time-death', name: 'Estimation of Time Since Death', difficulty: 'hard', estimatedHours: 2.5, completed: false, priority: 9, textbookReference: 'Chapter 5: Death' },
          { id: 'adipocere', name: 'Adipocere & Mummification', difficulty: 'medium', estimatedHours: 1.5, completed: false, priority: 7, textbookReference: 'Chapter 5: Death' },
        ]
      }
    ]
  }
]

// Helper functions
function getDaysUntil(date: Date): number {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatTimeLeft(days: number): string {
  if (days < 0) return 'Exam Passed'
  if (days === 0) return 'Today!'
  const months = Math.floor(days / 30)
  const remainingDays = days % 30
  if (months > 0) {
    return `${months}m ${remainingDays}d left`
  }
  return `${days} days left`
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'hard': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getDifficultyIcon(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '●'
    case 'medium': return '●●'
    case 'hard': return '●●●'
    default: return '●'
  }
}

// LocalStorage helpers for persistence
const STORAGE_KEY = 'riyans-dash-progress'

const getStoredProgress = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.error('Error loading progress:', e)
  }
  return new Set()
}

const saveProgress = (completedIds: Set<string>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedIds]))
  } catch (e) {
    console.error('Error saving progress:', e)
  }
}

// Initialize subjects with stored progress
const initializeSubjects = (): Subject[] => {
  const completedIds = getStoredProgress()
  return syllabusData.map(subject => ({
    ...subject,
    systems: subject.systems.map(system => ({
      ...system,
      topics: system.topics.map(topic => ({
        ...topic,
        completed: completedIds.has(`${subject.id}-${system.id}-${topic.id}`)
      }))
    }))
  }))
}

// Main Component
export default function MedicalExamDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>(initializeSubjects)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'subjects' | 'difficulty' | 'timeline'>('subjects')

  // Calculate overall progress
  const getTotalTopics = useCallback(() => {
    let total = 0
    subjects.forEach(s => s.systems.forEach(sys => total += sys.topics.length))
    return total
  }, [subjects])

  const getCompletedTopics = useCallback(() => {
    let completed = 0
    subjects.forEach(s => s.systems.forEach(sys => 
      completed += sys.topics.filter(t => t.completed).length
    ))
    return completed
  }, [subjects])

  const getTotalHours = useCallback(() => {
    let total = 0
    subjects.forEach(s => s.systems.forEach(sys => 
      total += sys.topics.reduce((sum, t) => sum + t.estimatedHours, 0)
    ))
    return total
  }, [subjects])

  const getRemainingHours = useCallback(() => {
    let remaining = 0
    subjects.forEach(s => s.systems.forEach(sys => 
      remaining += sys.topics.filter(t => !t.completed).reduce((sum, t) => sum + t.estimatedHours, 0)
    ))
    return remaining
  }, [subjects])

  // Toggle topic completion with persistence
  const toggleTopic = (subjectId: string, systemId: string, topicId: string) => {
    setSubjects(prev => {
      const newSubjects = prev.map(subject => {
        if (subject.id !== subjectId) return subject
        return {
          ...subject,
          systems: subject.systems.map(system => {
            if (system.id !== systemId) return system
            return {
              ...system,
              topics: system.topics.map(topic => {
                if (topic.id !== topicId) return topic
                return { ...topic, completed: !topic.completed }
              })
            }
          })
        }
      })
      
      // Save progress to localStorage
      const completedIds = new Set<string>()
      newSubjects.forEach(subject => {
        subject.systems.forEach(system => {
          system.topics.forEach(topic => {
            if (topic.completed) {
              completedIds.add(`${subject.id}-${system.id}-${topic.id}`)
            }
          })
        })
      })
      saveProgress(completedIds)
      
      return newSubjects
    })
  }

  // Reset all progress
  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY)
      setSubjects(syllabusData.map(subject => ({
        ...subject,
        systems: subject.systems.map(system => ({
          ...system,
          topics: system.topics.map(topic => ({
            ...topic,
            completed: false
          }))
        }))
      })))
    }
  }

  // Get topics by difficulty across all subjects
  const getTopicsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    const topics: { subject: Subject; system: System; topic: Topic }[] = []
    subjects.forEach(subject => {
      subject.systems.forEach(system => {
        system.topics.forEach(topic => {
          if (topic.difficulty === difficulty) {
            topics.push({ subject, system, topic })
          }
        })
      })
    })
    return topics.sort((a, b) => b.topic.priority - a.topic.priority)
  }

  // Calculate subject progress
  const getSubjectProgress = (subject: Subject) => {
    const total = subject.systems.reduce((sum, sys) => sum + sys.topics.length, 0)
    const completed = subject.systems.reduce((sum, sys) => 
      sum + sys.topics.filter(t => t.completed).length, 0
    )
    return total > 0 ? (completed / total) * 100 : 0
  }

  // Get next exam
  const getNextExam = () => {
    const now = new Date()
    const upcoming = subjects
      .filter(s => s.examDate > now)
      .sort((a, b) => a.examDate.getTime() - b.examDate.getTime())
    return upcoming[0]
  }

  // Generate recommended daily schedule
  const getRecommendedSchedule = () => {
    const now = new Date()
    const nextExam = getNextExam()
    if (!nextExam) return null
    
    const daysUntil = getDaysUntil(nextExam.examDate)
    const remainingHours = getRemainingHours()
    const hoursPerDay = Math.ceil(remainingHours / Math.max(daysUntil, 1))
    
    return {
      subject: nextExam.name,
      daysUntil,
      hoursPerDay,
      totalHours: remainingHours
    }
  }

  const schedule = getRecommendedSchedule()
  const nextExam = getNextExam()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                <img 
                  src="/robot-logo.png" 
                  alt="Riyan's Dash Logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Riyan's Dash</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Medical Exam Prep Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetProgress}
                className="text-slate-600 hover:text-red-600 hover:border-red-300"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white">
                <CardContent className="p-3 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Next: {nextExam?.name} in {getDaysUntil(nextExam?.examDate || new Date())} days
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100">Overall Progress</CardDescription>
              <CardTitle className="text-3xl font-bold">{getCompletedTopics()}/{getTotalTopics()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(getCompletedTopics() / getTotalTopics()) * 100} className="h-2 bg-blue-400" />
              <p className="text-sm text-blue-100 mt-2">Topics Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-100">Study Hours</CardDescription>
              <CardTitle className="text-3xl font-bold">{getRemainingHours().toFixed(0)}h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-100">of {getTotalHours().toFixed(0)} hours remaining</p>
              <p className="text-xs text-emerald-200 mt-1">~{(getRemainingHours() / 6).toFixed(0)} days at 6h/day</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-100">Daily Target</CardDescription>
              <CardTitle className="text-3xl font-bold">{schedule?.hoursPerDay || 0}h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-100">Hours/day recommended</p>
              <p className="text-xs text-amber-200 mt-1">for {schedule?.subject}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-pink-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-rose-100">Exam Countdown</CardDescription>
              <CardTitle className="text-3xl font-bold">{getDaysUntil(new Date('2026-04-07'))}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-rose-100">Days until first exam</p>
              <p className="text-xs text-rose-200 mt-1">Pharmacology on Apr 7, 2026</p>
            </CardContent>
          </Card>
        </div>

        {/* Exam Schedule Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Exam Schedule - April 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {subjects.sort((a, b) => a.examDate.getTime() - b.examDate.getTime()).map((subject, idx) => (
                <div key={subject.id} className="flex items-center">
                  <div className={`relative flex items-center gap-3 p-4 rounded-xl border-2 ${
                    getDaysUntil(subject.examDate) <= 30 ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                  }`}>
                    <div className={`p-2 rounded-lg ${subject.color} text-white`}>
                      {subject.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{subject.name}</p>
                      <p className="text-sm text-slate-500">
                        {subject.examDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant={getDaysUntil(subject.examDate) <= 30 ? 'destructive' : 'secondary'}>
                      {formatTimeLeft(getDaysUntil(subject.examDate))}
                    </Badge>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4">
                      <Progress value={getSubjectProgress(subject)} className="h-1" />
                    </div>
                  </div>
                  {idx < subjects.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-slate-300 mx-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              By Subject
            </TabsTrigger>
            <TabsTrigger value="difficulty" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              By Difficulty
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* By Subject View */}
          <TabsContent value="subjects" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.map(subject => (
                <Card key={subject.id} className="overflow-hidden">
                  <CardHeader className={`${subject.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {subject.icon}
                        <div>
                          <CardTitle>{subject.name}</CardTitle>
                          <p className="text-sm opacity-90">{subject.textbook}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {formatTimeLeft(getDaysUntil(subject.examDate))}
                        </Badge>
                        <p className="text-sm mt-1">{getSubjectProgress(subject).toFixed(0)}% done</p>
                      </div>
                    </div>
                    <Progress value={getSubjectProgress(subject)} className="h-2 bg-white/20 mt-3" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <Accordion type="multiple" className="w-full">
                        {subject.systems.map(system => {
                          const systemCompleted = system.topics.filter(t => t.completed).length
                          const systemTotal = system.topics.length
                          return (
                            <AccordionItem key={system.id} value={`${subject.id}-${system.id}`}>
                              <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{system.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {systemCompleted}/{systemTotal}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {system.topics.filter(t => t.difficulty === 'hard').length > 0 && (
                                      <Badge className="bg-red-100 text-red-700 text-xs">Hard: {system.topics.filter(t => t.difficulty === 'hard').length}</Badge>
                                    )}
                                    <Progress value={(systemCompleted / systemTotal) * 100} className="w-20 h-2" />
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                  {system.topics.sort((a, b) => {
                                    // Sort by: incomplete first, then by priority (high to low)
                                    if (a.completed !== b.completed) return a.completed ? 1 : -1
                                    return b.priority - a.priority
                                  }).map(topic => (
                                    <div 
                                      key={topic.id} 
                                      className={`p-3 rounded-lg border transition-all ${
                                        topic.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Checkbox 
                                          checked={topic.completed}
                                          onCheckedChange={() => toggleTopic(subject.id, system.id, topic.id)}
                                        />
                                        <div className="flex-1">
                                          <p className={`font-medium ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                            {topic.name}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge className={`text-xs ${getDifficultyColor(topic.difficulty)}`}>
                                              {getDifficultyIcon(topic.difficulty)} {topic.difficulty}
                                            </Badge>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {topic.estimatedHours}h
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                              <Target className="h-3 w-3" />
                                              P{topic.priority}
                                            </span>
                                            {topic.pastQuestions && topic.pastQuestions.length > 0 && (
                                              <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300">
                                                {topic.pastQuestions.length} Qs
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        {topic.textbookReference && (
                                          <span className="text-xs text-slate-400 max-w-[150px] text-right">
                                            {topic.textbookReference}
                                          </span>
                                        )}
                                      </div>
                                      {/* Past Questions Section */}
                                      {topic.pastQuestions && topic.pastQuestions.length > 0 && (
                                        <div className="mt-3 pl-7 space-y-2">
                                          <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            Past Exam Questions ({topic.pastQuestions.length})
                                          </div>
                                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                            {topic.pastQuestions.map((q, idx) => (
                                              <div 
                                                key={idx}
                                                className="text-xs bg-slate-50 border border-slate-100 rounded p-2"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-[10px] px-1 py-0 shrink-0 ${
                                                      q.type === 'long' ? 'border-purple-300 text-purple-600' :
                                                      q.type === 'short' ? 'border-blue-300 text-blue-600' :
                                                      q.type === 'mcq' ? 'border-green-300 text-green-600' :
                                                      'border-orange-300 text-orange-600'
                                                    }`}
                                                  >
                                                    {q.type.toUpperCase()}
                                                  </Badge>
                                                  <span className="text-slate-700 leading-relaxed">{q.question}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 ml-8 text-[10px] text-slate-400">
                                                  {q.year && <span>{q.year}</span>}
                                                  {q.university && <span>• {q.university}</span>}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Difficulty View */}
          <TabsContent value="difficulty" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Easy Topics */}
              <Card>
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500 text-white">
                      <Circle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-green-800">Easy Topics</CardTitle>
                      <p className="text-sm text-green-600">
                        {getTopicsByDifficulty('easy').filter(t => t.topic.completed).length}/{getTopicsByDifficulty('easy').length} completed
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(getTopicsByDifficulty('easy').filter(t => t.topic.completed).length / getTopicsByDifficulty('easy').length) * 100} 
                    className="h-2 bg-green-200" 
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                      {getTopicsByDifficulty('easy').map(({ subject, system, topic }) => (
                        <div 
                          key={`${subject.id}-${system.id}-${topic.id}`}
                          className={`p-3 rounded-lg border transition-all ${
                            topic.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={topic.completed}
                              onCheckedChange={() => toggleTopic(subject.id, system.id, topic.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {topic.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{subject.name}</Badge>
                                <span className="text-xs text-slate-500">{topic.estimatedHours}h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Medium Topics */}
              <Card>
                <CardHeader className="bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-yellow-500 text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-yellow-800">Medium Topics</CardTitle>
                      <p className="text-sm text-yellow-600">
                        {getTopicsByDifficulty('medium').filter(t => t.topic.completed).length}/{getTopicsByDifficulty('medium').length} completed
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(getTopicsByDifficulty('medium').filter(t => t.topic.completed).length / getTopicsByDifficulty('medium').length) * 100} 
                    className="h-2 bg-yellow-200" 
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                      {getTopicsByDifficulty('medium').map(({ subject, system, topic }) => (
                        <div 
                          key={`${subject.id}-${system.id}-${topic.id}`}
                          className={`p-3 rounded-lg border transition-all ${
                            topic.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-yellow-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={topic.completed}
                              onCheckedChange={() => toggleTopic(subject.id, system.id, topic.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {topic.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{subject.name}</Badge>
                                <span className="text-xs text-slate-500">{topic.estimatedHours}h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Hard Topics */}
              <Card>
                <CardHeader className="bg-red-50 border-b border-red-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500 text-white">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-red-800">Hard Topics</CardTitle>
                      <p className="text-sm text-red-600">
                        {getTopicsByDifficulty('hard').filter(t => t.topic.completed).length}/{getTopicsByDifficulty('hard').length} completed
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(getTopicsByDifficulty('hard').filter(t => t.topic.completed).length / getTopicsByDifficulty('hard').length) * 100} 
                    className="h-2 bg-red-200" 
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                      {getTopicsByDifficulty('hard').map(({ subject, system, topic }) => (
                        <div 
                          key={`${subject.id}-${system.id}-${topic.id}`}
                          className={`p-3 rounded-lg border transition-all ${
                            topic.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={topic.completed}
                              onCheckedChange={() => toggleTopic(subject.id, system.id, topic.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {topic.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{subject.name}</Badge>
                                <span className="text-xs text-slate-500">{topic.estimatedHours}h</span>
                                <span className="text-xs text-red-600 font-medium">Priority: {topic.priority}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Timeline Recommendation</CardTitle>
                <CardDescription>
                  Topics prioritized by exam date and difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjects.sort((a, b) => a.examDate.getTime() - b.examDate.getTime()).map(subject => {
                    const daysUntil = getDaysUntil(subject.examDate)
                    const remainingHours = subject.systems.reduce((sum, sys) => 
                      sum + sys.topics.filter(t => !t.completed).reduce((s, t) => s + t.estimatedHours, 0), 0
                    )
                    const hoursPerDay = Math.ceil(remainingHours / Math.max(daysUntil, 1))
                    
                    // Get incomplete topics sorted by priority and difficulty
                    const prioritizedTopics = subject.systems
                      .flatMap(sys => sys.topics.filter(t => !t.completed).map(t => ({ ...t, system: sys.name })))
                      .sort((a, b) => {
                        // Sort by priority first, then by difficulty (hard first)
                        if (a.priority !== b.priority) return b.priority - a.priority
                        const diffOrder = { hard: 0, medium: 1, easy: 2 }
                        return diffOrder[a.difficulty] - diffOrder[b.difficulty]
                      })

                    return (
                      <div key={subject.id} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${subject.color} text-white`}>
                              {subject.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{subject.name}</h3>
                              <p className="text-sm text-slate-500">
                                {formatTimeLeft(daysUntil)} • {remainingHours}h remaining
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={daysUntil <= 60 ? 'destructive' : 'secondary'}>
                              {hoursPerDay}h/day needed
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-sm text-red-600 font-medium">Hard Topics</p>
                            <p className="text-2xl font-bold text-red-700">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'hard' && !t.completed)).length}
                            </p>
                            <p className="text-xs text-red-500">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'hard' && !t.completed)).reduce((sum, t) => sum + t.estimatedHours, 0)}h
                            </p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-sm text-yellow-600 font-medium">Medium Topics</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'medium' && !t.completed)).length}
                            </p>
                            <p className="text-xs text-yellow-500">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'medium' && !t.completed)).reduce((sum, t) => sum + t.estimatedHours, 0)}h
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-sm text-green-600 font-medium">Easy Topics</p>
                            <p className="text-2xl font-bold text-green-700">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'easy' && !t.completed)).length}
                            </p>
                            <p className="text-xs text-green-500">
                              {subject.systems.flatMap(s => s.topics.filter(t => t.difficulty === 'easy' && !t.completed)).reduce((sum, t) => sum + t.estimatedHours, 0)}h
                            </p>
                          </div>
                        </div>

                        {prioritizedTopics.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-slate-600 mb-2">Priority Study Order:</p>
                            <div className="flex flex-wrap gap-2">
                              {prioritizedTopics.slice(0, 8).map((topic, idx) => (
                                <Badge 
                                  key={topic.id}
                                  className={`${getDifficultyColor(topic.difficulty)} cursor-pointer`}
                                  onClick={() => toggleTopic(subject.id, subject.systems.find(s => s.name === topic.system)?.id || '', topic.id)}
                                >
                                  {idx + 1}. {topic.name}
                                </Badge>
                              ))}
                              {prioritizedTopics.length > 8 && (
                                <Badge variant="outline">+{prioritizedTopics.length - 8} more</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Difficulty Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Understanding Difficulty Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500 text-white">● Easy</Badge>
                  <span className="text-sm text-green-700">Direct concepts</span>
                </div>
                <p className="text-sm text-green-600">
                  Straightforward topics with clear definitions, basic clinical correlations, and direct memorization. 
                  Examples: Gynaecomastia, Lung Abscess, Iron deficiency.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-500 text-white">●● Medium</Badge>
                  <span className="text-sm text-yellow-700">Integration needed</span>
                </div>
                <p className="text-sm text-yellow-600">
                  Requires understanding of pathophysiology, some system integration, and moderate clinical application.
                  Examples: Rheumatic Fever, Viral Hepatitis, Antihypertensives.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-red-500 text-white">●●● Hard</Badge>
                  <span className="text-sm text-red-700">Complex mechanisms</span>
                </div>
                <p className="text-sm text-red-600">
                  Complex pathophysiology, multiple system involvement, requires deep understanding and synthesis.
                  Examples: Glomerular Diseases, IBD, Antivirals, Study Designs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Textbook References */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Textbook References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {subjects.map(subject => (
                <div key={subject.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${subject.color} text-white`}>
                      {subject.icon}
                    </div>
                    <span className="font-medium text-sm">{subject.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">{subject.textbook}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-8 py-4 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>🤖 Riyan's Dash • Medical Exam Prep Dashboard • Ace your exams!</p>
        </div>
      </footer>
    </div>
  )
}
