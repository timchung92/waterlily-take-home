import { useState, useRef, useEffect, forwardRef } from 'react';
import { AuthContainer } from '..';
import { Tooltip } from '@mui/material';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

type AuthTermsOfServiceProps = {
  onAccept: () => void;
};
export function AuthTermsOfService({ onAccept }: AuthTermsOfServiceProps) {
  const [hasAgreedToTos, setHasAgreedToTos] = useState(false);
  const [userDeclined, setUserDeclined] = useState(false);

  const handleAccept = () => {
    setUserDeclined(false);
    onAccept();
  };

  const acknowledgeTosTooltip = (
    <Tooltip
      title={
        <span className="text-sm">
          Check the box to agree to the Terms of Service
        </span>
      }
    >
      <span>Accept</span>
    </Tooltip>
  );

  return (
    <AuthContainer title="">
      <div className="flex flex-col items-center justify-center ">
        <div className="bg-whit w-full max-w-2xl rounded text-gray-700">
          <h1 className="mb-2 text-2xl font-semibold">Terms of Services</h1>
          <p className="mb-4 text-base italic">
            Please read and acknowledge our Terms of Service carefully before
            using our Services.
          </p>
          <div className="h-96 gap-y-1 overflow-y-auto rounded-md border border-gray-300 p-4 text-gray-700">
            <TermsOfServiceContent />
            <p className="my-6 flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                id="termsOfServiceAgreement"
                name="termsOfServiceAgreement"
                defaultChecked={false}
                className="mt-1.5 h-4 w-4 flex-shrink-0"
                onChange={() => setHasAgreedToTos(!hasAgreedToTos)}
                onClick={() => setHasAgreedToTos(!hasAgreedToTos)}
              />
              <label
                className="text-gray-700"
                htmlFor="termsOfServiceAgreement"
              >
                I acknowledge that I have read and agree to the Terms of
                Services.
              </label>
            </p>
          </div>
          <DeclineAlert
            isOpen={userDeclined}
            message="You must accept the terms to continue"
          />
          <div className="flex flex-row-reverse items-center gap-3">
            <button
              className={`mt-4 rounded-md px-6 py-2 font-semibold text-white ${
                hasAgreedToTos
                  ? 'bg-darkPurple hover:bg-mediumPurple'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
              disabled={!hasAgreedToTos}
              onClick={handleAccept}
            >
              {hasAgreedToTos ? 'Continue' : acknowledgeTosTooltip}
            </button>
            <button
              className={`mt-4 rounded-md border border-gray-600 bg-white px-6 py-2 font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900`}
              onClick={() => setUserDeclined(true)}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </AuthContainer>
  );
}

function TermsOfServiceHeader({ text }: { text: string }) {
  return <h1 className="mb-2 text-lg font-semibold">{text}</h1>;
}

function TermsOfServiceBody({ text }: { text: string }) {
  return <p className="mb-4 text-base">{text}</p>;
}

const TermsOfServiceContent = () => {
  return (
    <>
      <TermsOfServiceHeader text={'1. Acceptance of Terms'} />
      <TermsOfServiceBody
        text={`By accessing or using Waterlily’s eldercare planning services (the “Services”), you agree to comply with and be bound by these Terms of Service (“Terms”) and our Privacy Policy, which govern your access and use of the Services. We may update these Terms from time to time. If we make material changes, we will notify you by email or through a notice on our Services. It is your responsibility to review these Terms and the Privacy Policy periodically to be aware of any modifications.`}
      />
      <TermsOfServiceHeader text={'2. Ownership and Limited License'} />
      <TermsOfServiceBody
        text={`The Services, including all text, graphics, images, and other content, are owned by Waterlily or our licensors and are protected under United States and foreign laws. Waterlily retains all rights not expressly granted to you herein. You are granted a limited, nonexclusive, nontransferable, non-sublicensable, revocable license to access and use our Services as permitted under these Terms.`}
      />
      <TermsOfServiceHeader text={'3. Trademarks'} />
      <TermsOfServiceBody
        text={`The Waterlily name, logos, slogans, and look and feel are trademarks of Waterlily and may not be used without prior written permission.`}
      />
      <TermsOfServiceHeader text={'4. Feedback'} />
      <TermsOfServiceBody
        text={`Any feedback you provide regarding the Services is voluntary and appreciated. By submitting feedback, you grant Waterlily a non-exclusive, royalty-free license to use, reproduce, and incorporate your feedback into the Services or other products.`}
      />
      <TermsOfServiceHeader text={'5. Personal Information'} />
      <TermsOfServiceBody
        text={`Waterlily will process personal information as necessary to provide and improve the Services or comply with the law. If you provide personal information about others, you warrant that you are authorized to disclose such information and that all such disclosure complies with applicable laws and regulations.`}
      />
      <TermsOfServiceHeader text={'6. Restrictions'} />
      <TermsOfServiceBody
        text={`You shall not: Decompile, reverse engineer, disassemble, or otherwise attempt to derive the source code of the Services. Modify, translate, or create derivative works based on the Services.Use the Services for any unlawful purpose or in violation of any applicable laws or regulations.`}
      />
      <TermsOfServiceHeader text={'Acknowledgment of Non-Responsibility:'} />
      <TermsOfServiceBody
        text={`You acknowledge that Waterlily does not undertake and is not responsible for any insurance or financial product recommendations that might be made to consumers. You release Waterlily from any actual or alleged liability related to insurance or financial product recommendations directed to any consumer or purchaser of a financial or insurance product, regardless of whether Waterlily products are used in making any such recommendation.`}
      />
      <TermsOfServiceHeader text={'7. Disclaimers'} />
      <TermsOfServiceBody
        text={`Waterlily strives to provide accurate health projections, financial product and policy extraction, modeling, and calculation services but provides them "as is," without warranties, express or implied, and disclaims responsibility for any inaccuracies. You are solely responsible for verifying and correcting any extracted product information and calculations against original product documentation, and to review the Disclaimers and Disclosures and Methodology to understand how any health predictions and financial projections are made, and how to interpret them.`}
      />
      <TermsOfServiceHeader text={'8. Limitation of Liability'} />
      <TermsOfServiceBody
        text={`To the maximum extent permitted by law, in no event shall Waterlily be liable for any indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with your use of the Services, except in cases of gross negligence or willful misconduct.`}
      />
      <TermsOfServiceHeader text={'9. Indemnification'} />
      <TermsOfServiceBody
        text={`You agree to indemnify, defend, and hold harmless Waterlily and its directors, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with: Your access to or use of the Services. Your violation of these Terms. Your violation of any applicable laws or regulations.`}
      />
      <TermsOfServiceHeader text={'10. Compliance with Laws'} />
      <TermsOfServiceBody
        text={`You represent and warrant that you will use the Services in compliance with all applicable laws and regulations, including those related to financial planning, insurance, securities, marketing, privacy, and data security.`}
      />
      <TermsOfServiceHeader text={'11. Modifications to Services'} />
      <TermsOfServiceBody
        text={`While we will endeavor to provide reasonable notice before significant changes, Waterlily reserves the right to modify or discontinue, temporarily or permanently, the Services (or any part thereof) with or without notice. You agree that Waterlily shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Services.`}
      />
      <TermsOfServiceHeader text={'12. Termination'} />
      <TermsOfServiceBody
        text={`Waterlily may terminate or suspend your access to the Services immediately if you breach these Terms or engage in unlawful activities. Upon termination, your right to use the Services will cease.`}
      />
      <TermsOfServiceHeader text={'13. Governing Law'} />
      <TermsOfServiceBody
        text={`These Terms shall be governed and construed in accordance with the laws of the State of Nevada, without regard to its conflict of law provisions. You agree to comply with all local laws applicable to your use of the Services.`}
      />
      <TermsOfServiceHeader text={'14. Severability'} />
      <TermsOfServiceBody
        text={`If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.`}
      />
      <TermsOfServiceHeader text={'15. Contact Us'} />
      <TermsOfServiceBody
        text={`If you have any questions about these Terms, please contact us at hello@joinwaterlily.com.`}
      />
    </>
  );
};

interface ErrorAlertProps {
  isOpen: boolean;
  message: string;
}

const DeclineAlert = ({ isOpen, message }: ErrorAlertProps) => {
  if (!isOpen) return null;

  return (
    <div className="my-4 border-l-4 border-yellow-400 bg-yellow-50 p-2">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-base text-yellow-700">{message}</p>
        </div>
      </div>
    </div>
  );
};
