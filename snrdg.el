;;; snrdg.el --- Generate ServiceNow RDGs from Emacs -*- lexical-binding: t -*-

;; Author: Julian Hoch
;; Maintainer: Julian Hoch
;; Version: 0.1.0
;; Package-Requires: (snsync,servicenow)
;; Homepage: https://github.com/julian-hoch/snRDG
;; Keywords: servicenow 


;; This file is not part of GNU Emacs

;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <https://www.gnu.org/licenses/>.


;;; Commentary:

;; This package allows generation of row data gateways for ServiceNow tables.

;;; Code:

(defvar snrdg-temp-buffer "*snrdg-temp*"
  "Temporary buffer for running snrdg commands.")

;;; Customization

(defgroup snrdg ()
  "Generate ServiceNow RDGs from Emacs"
  :group 'servicenow)

(defcustom snrdg-template "class_es6"
  "Default template to use for generating RDG code."
  :type 'string
  :group 'snrdg)

(defcustom snrdg-mode #'js-mode
  "Major mode to use for displaying generated RDG code."
  :type 'function
  :group 'snrdg)

;;; CLI integration and testing

(defun snrdg--run (args)
  "Run `snrdg' with ARGS in the base directory of snSYNC."
  (interactive "sArguments: ")
  (require 'snsync)
  (with-current-buffer (get-buffer-create snrdg-temp-buffer)
    (erase-buffer)
    (funcall snrdg-mode))
  (let* ((default-directory snsync-base-dir)
         (result (apply 'call-process "snrdg" nil "*snrdg-temp*" t (split-string args))))
    (if (eq result 0)
        (message "snrdg %s succeeded" args)
      (with-current-buffer "*snrdg-temp*"
        (message "snrdg %s failed: %s" args (buffer-string))))))

;;;###autoload
(defun snrdg-test ()
  "Run `snrdg test' in the base directory of snSYNC."
  (interactive)
  (snrdg--run "test --silent"))


;;; Getting table schemas

;;;###autoload
(defun snrdg-get-table-schema (table)
  "Get the schema for TABLE as a hash table."
  (interactive "sTable name: ")
  (unless (snrdg--run (concat "schema --silent " table))
    (error "Failed to get schema for table %s" table))
  (with-current-buffer snrdg-temp-buffer
    (goto-char (point-min))
    (json-parse-buffer)))

;;; Generating RDG code

(defun snrdg--generate (table className &optional template)
  "Run `snrdg generate' in the base directory of snSYNC."
  (interactive "sTable name: \nsClass name: ")
  (let* ((template (or template snrdg-template))
         (args (concat "generate --silent "
                       table " "
                       className " "
                       template)))
    (snrdg--run args)))


;;; snSYNC integration

(defun snrdg--guess-table-name ()
  "Guess the table name from the current buffer content."
  (save-excursion)
  (goto-char (point-min))
  (unless (re-search-forward "table schema of the table '\\([a-zA-Z0-9_]+\\)'" nil t)
    (error "Could not find table name in buffer"))
  (substring-no-properties (match-string 1)))

(defun snrdg--guess-class-name (table)
  "Guess the class name from TABLE.  Will convert to CamelCase and apply RDG suffix."
  (let* ((parts (split-string table "_"))
         (camelCase (mapconcat 'capitalize parts "")))
    (concat camelCase "RDG")))

;;;###autoload
(defun snrdg-generate (table &optional className template)
  "Generate the RDG code for TABLE.  Will guess CLASSNAME from TABLE if not provided."
  (interactive "sTable name: \nsClass name (optional): ")
  (let* ((className (or className (snrdg--guess-class-name table)))
         (template (or template snrdg-template)))
    (snrdg--generate table className template)
    (switch-to-buffer snrdg-temp-buffer)))

;;;###autoload
(defun snrdg-regenerate ()
  "Regenerate the RDG code for the current buffer."
  (interactive)
  (require 'snsync)
  (unless (snsync--buffer-connected-p)
    (error "Current buffer is not connected to a ServiceNow instance"))
  (unless (string= snsync-current-table "sys_script_include")
    (error "Current buffer is not a script include"))
  (snrdg--generate (snrdg--guess-table-name)
                   snsync-current-display-value)
  (replace-buffer-contents snrdg-temp-buffer))

(provide 'snrdg)

;;; snrdg.el ends here
