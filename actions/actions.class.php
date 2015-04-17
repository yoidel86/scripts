<?php

require_once dirname(__FILE__).'/../lib/affiliateGeneratorConfiguration.class.php';
require_once dirname(__FILE__).'/../lib/affiliateGeneratorHelper.class.php';

/**
 * affiliate actions.
 *
 * @package    workit
 * @subpackage affiliate
 * @author     Your name here
 * @version    SVN: $Id: actions.class.php 23810 2009-11-12 11:07:44Z Kris.Wallsmith $
 */
class affiliateActions extends autoAffiliateActions
{
    public function executeListActivate()
    {
    $affiliate = $this->getRoute()->getObject();
    $affiliate->activate();

    // send an email to the affiliate
    $message = $this->getMailer()->compose(
      array('yoidel86@datys.cu' => 'workit Bot'),
      $affiliate->getEmail(),
         'workit affiliate token',
<<<EOF
Your workit affiliate account has been activated.

Your token is {$affiliate->getToken()}.

The workit Bot.
EOF
    );

    $this->getMailer()->send($message);

    $this->redirect('workit_affiliate');
    }

    public function executeListDeactivate()
    {
        $this->getRoute()->getObject()->deactivate();

        $this->redirect('workit_affiliate');
    }

    public function executeBatchActivate(sfWebRequest $request)
    {
        $q = Doctrine_Query::create()
         ->from('workitAffiliate a')
         ->whereIn('a.id', $request->getParameter('ids'));

        $affiliates = $q->execute();

        foreach ($affiliates as $affiliate)
        {
            $affiliate->activate();
        }

        $this->redirect('workit_affiliate');
    }

    public function executeBatchDeactivate(sfWebRequest $request)
    {
        $q = Doctrine_Query::create()
          ->from('workitAffiliate a')
          ->whereIn('a.id', $request->getParameter('ids'));

        $affiliates = $q->execute();

        foreach ($affiliates as $affiliate)
        {
          $affiliate->deactivate();
        }

        $this->redirect('workit_affiliate');
    }
}
