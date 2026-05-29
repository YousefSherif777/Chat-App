const ErrorCodes = {
  ERR_INTERNAL:"ERR_INTERNAL",
  ERR_BAD_REQUEST:"ERR_BAD_REQUEST",  
  ERR_UNAUTHORIZED:"ERR_UNAUTHORIZED", 
  ERR_FORBIDDEN:"ERR_FORBIDDEN", 
  ERR_NOT_FOUND:"ERR_NOT_FOUND",  
}

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'ERR_INTERNAL') {
    super(message)   
    this.statusCode = statusCode
    this.errorCode  = errorCode
    Error.captureStackTrace(this, this.constructor) 
  }
}


class NotFoundException extends AppError {
  constructor(message = 'Resource Not Found') {
    super(message, 404, 'ERR_NOT_FOUND') 
  }
}

class BadRequestException extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400, 'ERR_BAD_REQUEST')
  }
}

class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized Access') {
    super(message, 401, 'ERR_UNAUTHORIZED')
  }
}

class InternalServerException extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, 'ERR_INTERNAL')
  }
}



